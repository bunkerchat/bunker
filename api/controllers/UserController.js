/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';
var moment = require('moment');
var Promise = require('bluebird');

// A connecting client will call this endpoint. It should subscribe them to all relevant data and
// return all rooms and user data necessary to run the application.
module.exports.init = function (req, res) {

	var localUser, localUserSettings, localMemberships, localInboxMessages;

	Promise.join(
		User.findOne(req.session.userId),
		UserSettings.findOne({user: req.session.userId}),
		RoomMember.find({user: req.session.userId}).populate('room'),
		InboxMessage.find({user: req.session.userId}).sort('createdAt DESC').limit(20).populate('message')
	)
		.spread(function (user, userSettings, memberships, inboxMessages) {

			localUser = user;
			localUserSettings = userSettings;
			localMemberships = memberships;
			localInboxMessages = inboxMessages;
			var rooms = _(memberships).pluck('room').compact().value();
			var inboxUserIds = _(inboxMessages).pluck('message').pluck('author').unique().value();

			// de-associate a room from a membership since we set rooms above
			_.each(localMemberships, function (membership) {
				if (!membership.room) return;
				membership.room = membership.room.id;
			});

			// Setup subscriptions
			User.subscribe(req, user, ['update', 'message']);
			UserSettings.subscribe(req, userSettings, 'update');
			RoomMember.subscribe(req, memberships, ['update', 'destroy', 'message']);
			Room.subscribe(req, rooms, ['update', 'destroy', 'message']);
			InboxMessage.subscribe(req, user.id, 'message');

			return Promise.all([

				// Get all room members and 40 initial messages for each room
				Promise.map(rooms, function (room) {
					return Promise.join(
						Message.find({room: room.id}).sort('createdAt DESC').limit(40).populate('author'),
						RoomMember.find({room: room.id}).populate('user')
					)
						.spread(function (messages, members) {
							RoomMember.subscribe(req, members, ['update', 'destroy']);
							User.subscribe(req, _.pluck(members, 'user'), 'update');

							room.$messages = [];
							_.each(messages, function(message) {
								room.$messages.push(message.toJSON());
							});

							room.$members = [];
							_.each(members, function(member) {
								room.$members.push(member.toJSON());
							});

							return room;
						});
				}),

				// Populate authors for inbox messages
				User.find(inboxUserIds)
					.then(function (inboxUsers) {
						return Promise.map(localInboxMessages, function (inboxMessage) {

							var authorData = _.find(inboxUsers, {id: inboxMessage.message.author});
							if (authorData) {
								inboxMessage.message.author = authorData.toJSON();
							}

							return inboxMessage;
						});
					})
			]);
		})
		.spread(function (rooms, inboxMessages) {
			return {
				user: localUser.toJSON(),
				userSettings: localUserSettings,
				memberships: localMemberships,
				inbox: inboxMessages,
				rooms: rooms
			};
		})
		.then(res.ok)
		.catch(res.serverError);
};

// Activity update route. This will respond to PUT /user/current/activity
// This route only allows updates to present and typingIn.
// It can only be called by the current user.
// It's sole purpose is to enable away and typing notifications.
module.exports.activity = function (req, res) {

	// Only allow updates for the following values
	// There's no need for us to save these in the db, this may change in the future
	var typingIn = req.body.typingIn;
	var present = req.body.present;
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true,
		lastActivity: new Date().toISOString()
	};

	User.publishUpdate(req.session.userId, updates);
	res.ok(updates);
};

module.exports.connect = function (req, res) {
	var lastConnected, previouslyConnected;

	User.findOne(req.session.userId)
		.then(function (user) {
			lastConnected = user.lastConnected;
			previouslyConnected = user.connected;

			if (!user.sockets) user.sockets = [];
			user.sockets.push(req.socket.id);
			user.connected = true;
			user.lastConnected = new Date().toISOString();
			user.typingIn = null;
			user.present = true;

			return user.save();
		})
		.then(function (user) {

			User.publishUpdate(user.id, user);

			// Send connecting message, if not previously connected or reconnecting
			//if (!previouslyConnected && Math.abs(moment(lastConnected).diff(moment(), 'seconds')) > userService.connectionUpdateWaitSeconds) {
			//	RoomService.messageRoomsWithUser({
			//		userId: user.id,
			//		systemMessage: user.nick + ' is now online'
			//	});
			//}

			// Clear any disconnect messages that haven't gone out yet
			if (userService.pendingTasks[user.id]) {
				clearTimeout(userService.pendingTasks[user.id]);
				userService.pendingTasks[user.id] = null;
			}

			// ARS wasn't seeing a data object, so return an empty one?
			return {};
		})
		.then(res.ok)
		.catch(res.serverError);
};

module.exports.markInboxRead = function (req, res) {
	InboxMessage.update({user: req.session.userId}, {read: true})
		.then(res.ok)
		.catch(res.serverError);
};

module.exports.clearInbox = function (req, res) {
	InboxMessage.destroy({user: req.session.userId})
		.then(res.ok)
		.catch(res.serverError);
};
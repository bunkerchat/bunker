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
		InboxMessage.find({user: req.session.userId}).limit(20).populate('message')
	)
		.spread(function (user, userSettings, memberships, inboxMessages) {

			localUser = user;
			localUserSettings = userSettings;
			localMemberships = memberships;
			localInboxMessages = inboxMessages;
			var rooms = _(memberships).pluck('room').compact().value();

			// Setup subscriptions
			User.subscribe(req, user, ['update', 'message']);
			UserSettings.subscribe(req, userSettings, 'update');
			RoomMember.subscribe(req, memberships, ['update', 'destroy', 'message']);
			Room.subscribe(req, rooms, ['update', 'destroy', 'message']);
			InboxMessage.subscribe(req, user.id, 'message');

			// Get some initial messages
			return Promise.map(rooms, function (room) {
				return Promise.join(
					Message.find({room: room.id}).sort('createdAt DESC').limit(40).populate('author'),
					RoomMember.find({room: room.id}).populate('user')
				)
					.spread(function (messages, members) {
						RoomMember.subscribe(req, members, ['update', 'destroy']);
						User.subscribe(req, _.pluck(members, 'user'), 'update');

						room.$messages = messages;
						room.$members = members;
						return room;
					});
			});
		})
		.then(function (rooms) {
			return {
				user: localUser.toJSON(),
				userSettings: localUserSettings,
				memberships: localMemberships,
				inbox: localInboxMessages,
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
			if (!previouslyConnected && Math.abs(moment(lastConnected).diff(moment(), 'seconds')) > userService.connectionUpdateWaitSeconds) {
				RoomService.messageRoomsWithUser({
					userId: user.id,
					systemMessage: user.nick + ' is now online'
				});
			}

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

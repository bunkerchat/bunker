/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';
var moment = require('moment');
var Promise = require('bluebird');

var emoticonService = require('./../services/emoticonService');
var userService = require('../services/userService');
var User = require('./../models/User');
var UserSettings = require('./../models/UserSettings');
var RoomMember = require('./../models/RoomMember');
var InboxMessage = require('./../models/InboxMessage');
var Room = require('./../models/Room');
var Message = require('./../models/Message');
var RoomController = require('./RoomController');

// A connecting client will call this endpoint. It should subscribe them to all relevant data and
// return all rooms and user data necessary to run the application.
module.exports.init = function (req, res) {

	var localUser, localUserSettings, localMemberships, localInboxMessages;

	var userId = req.session.userId.toObjectId();
	var socket = req.socket;

	// allows sending async messages back to connected client from server
	socket.join('userself_' + userId);

	Promise.join(
		User.findById(userId).lean(),
		UserSettings.findOne({user: userId}),
		RoomMember.find({user: userId}).sort('roomOrder').populate('room'),
		InboxMessage.find({user: req.session.userId}).sort('-createdAt').limit(20).populate('message')
		)
		.spread(function (user, userSettings, memberships, inboxMessages) {

			localUser = user;
			localUserSettings = userSettings;
			localMemberships = memberships;
			localInboxMessages = inboxMessages;
			var rooms = _(memberships).pluck('room').compact().value();
			var inboxUserIds = _(inboxMessages).pluck('message').pluck('author').unique().value();

			// de-associate a room from a membership since we set rooms above
			// and fix bad room order data
			_(localMemberships)
				.reject(function (membership) {
					return !membership.room;
				})
				.each(function (membership, index) {
					membership.room = membership.room._id;
					membership.roomOrder = index;
				})
				.value();

			// Setup subscriptions
			socket.join('user_' + userId);
			socket.join('inboxmessage_' + userId);

			_.each(memberships, function (membership) {
				socket.join('roommember_' + membership._id);
			});
			_.each(rooms, function (room) {
				socket.join('room_' + room._id);
			});

			return Promise.join(
				// Get all room members and 40 initial messages for each room
				Promise.map(rooms, function (room) {
					room = room.toJSON();

					return Promise.join(
						Message.find({room: room._id}).sort('-createdAt').limit(40).populate('author'),
						RoomMember.find({room: room._id}).populate('user')
						)
						.spread(function (messages, members) {

							// Setup subscriptions
							_.each(members, function (member) {
								socket.join('roommember_' + member._id);
							});

							_.each(_.pluck(members, 'user'), function (user) {
								socket.join('user_' + user._id);
							});

							room.$messages = [];
							_.each(messages, function (message) {
								room.$messages.push(message.toJSON());
							});

							room.$members = [];
							_.each(members, function (member) {
								room.$members.push(member.toJSON());
							});

							return room;
						});
				}),

				// Populate authors for inbox messages
				User.find(inboxUserIds)
					.then(function (inboxUsers) {
						return Promise.map(localInboxMessages, function (inboxMessage) {

							var authorData = _.find(inboxUsers, {_id: inboxMessage.message.author});
							if (authorData) {
								inboxMessage.message.author = authorData.toJSON();
							}

							return inboxMessage;
						});
					}),

				// fetch all emoticon counts for emoticon list
				emoticonService.emoticonCounts()
			);
		})
		.spread(function (rooms, inboxMessages, emoticonCounts) {
			return {
				user: localUser,
				userSettings: localUserSettings,
				memberships: localMemberships,
				inbox: inboxMessages,
				rooms: rooms,
				emoticonCounts: emoticonCounts
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
	var userId = req.session.userId;

	// Only allow updates for the following values
	// There's no need for us to save these in the db, this may change in the future
	var typingIn = req.body.typingIn;
	var present = req.body.present;
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true,
		lastActivity: new Date().toISOString()
	};

	req.io.to('user_' + userId).emit('user', {_id: userId, verb: 'updated', data: updates});
	res.ok(updates);
};

module.exports.connect = function (req, res) {
	var lastConnected, previouslyConnected;

	User.findById(req.session.userId.toObjectId())
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

			req.io.to('user_' + user._id).emit('user', {_id: user._id, verb: 'updated', data: user});

			// Clear any disconnect messages that haven't gone out yet
			if (userService.pendingTasks[user._id]) {
				clearTimeout(userService.pendingTasks[user._id]);
				userService.pendingTasks[user._id] = null;
			}

			res.ok({});
		})
		.catch(res.serverError);
};

module.exports.markInboxRead = function (req, res) {
	InboxMessage.update({user: req.session.userId.toObjectId()}, {read: true})
		.then(res.ok)
		.catch(res.serverError);
};

module.exports.clearInbox = function (req, res) {
	InboxMessage.remove({user: req.session.userId.toObjectId()})
		.then(res.ok)
		.catch(res.serverError);
};

/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';
var moment = require('moment');
var Promise = require('bluebird');

var log = require('../config/log');
var emoticonService = require('./../services/emoticonService');
var userService = require('../services/userService');
var versionService = require('../services/versionService');
var User = require('./../models/User');
var UserSettings = require('./../models/UserSettings');
var RoomMember = require('./../models/RoomMember');
var InboxMessage = require('./../models/InboxMessage');
var Room = require('./../models/Room');
var Message = require('./../models/Message');
var RoomController = require('./RoomController');
var PinnedMessage = require('./../models/PinnedMessage');

// A connecting client will call this endpoint. It should subscribe them to all relevant data and
// return all rooms and user data necessary to run the application.
module.exports.init = function (req, res) {

	var user, userSettings, memberships, inbox, rooms, version;
	var userIds = [];

	if (!req.session.userId) return res.ok();

	var userId = req.session.userId.toObjectId();
	var socket = req.socket;

	// allows sending async messages back to connected client from server
	socket.join('userself_' + userId);

	// find user sockets
	User.findById(userId, {sockets: 1}).then(user => {

		var sockets = user.sockets || [];
		_.remove(sockets, {socketId: req.socket.id});
		sockets.push({socketId: req.socket.id, updatedAt: new Date()});

		return User.findByIdAndUpdate(userId, {
			sockets: sockets,
			connected: true,
			lastConnected: new Date().toISOString(),
			typingIn: null
		}, {'new': true});
	})
		.then(updatedUser => {
			req.io.to('user_' + updatedUser._id).emit('user', {
				_id: updatedUser._id,
				verb: 'updated',
				data: updatedUser
			});

			return Promise.join(
				User.findById(userId).lean(),
				UserSettings.findOne({user: userId}).lean(),
				RoomMember.find({user: userId}).sort('roomOrder').populate('room').lean(),
				InboxMessage.find({user: req.session.userId}).sort('-createdAt').limit(20).populate('message').lean(),
				versionService.version()
			);
		})
		.spread((_user, _userSettings, _memberships, _inboxMessages, _version) => {

			user = _user;
			userSettings = _userSettings;
			memberships = _memberships;
			inbox = _inboxMessages;
			version = _version;

			var rooms = _(memberships).map('room').compact().value();

			// build up a list of userids to fetch from the database
			userIds.pushAll(_(inbox).map('message').map('author').uniq().value());
			userIds.pushAll(_.map(memberships, 'user'));

			// de-associate a room from a membership since we set rooms above
			// and fix bad room order data
			_(memberships)
				.reject(membership => !membership.room)
				.each((membership, index) => {
					membership.room = membership.room._id;
					membership.roomOrder = index;
				})

			// Setup subscriptions
			socket.join('user_' + userId);
			socket.join('inboxmessage_' + userId);

			_.each(memberships, membership => socket.join('roommember_' + membership._id));
			_.each(rooms, room => {
				socket.join('room_' + room._id);
				socket.join('pinnedMessage_' + room._id);
			});

			return Promise.map(rooms, room => {
				return Promise.join(
					Message.find({room: room._id}).sort('-createdAt').limit(40).lean(),
					RoomMember.find({room: room._id}).lean(),
					PinnedMessage.find({ room: room._id }).sort('-createdAt').populate('message')
				)
					.spread((messages, members, pinnedMessages) => {
						userIds.pushAll(_.map(messages, 'author'), _.map(members, 'user'));

						// Setup subscriptions
						_.each(members, member => socket.join('roommember_' + member._id));
						_.each(_.map(members, 'user'), user => socket.join('user_' + user));

						room.$messages = messages;
						room.$pinnedMessages = [];
						room.$members = members;

						var uniquePinnedMessages = _.uniq(pinnedMessages, 'message.id');

						_.each(uniquePinnedMessages, function(message) {
							room.$pinnedMessages.push(message.message);
						});

						return room;
					});
			});
		})
		.then(_rooms => {
			rooms = _rooms;
			// Populate authors
			//var userIdStrings = _(userIds).filter().map(userId=> userId.toString()).unique().value();
			return Promise.join(
				User.find(userIds).select('-plaintextpassword -sockets').lean(),
				Room.find({_id: {$nin: _.map(memberships, 'room')}, isPrivate: false}).lean()
					.then(rooms => {
						return Promise.map(rooms, room => {
							return RoomMember.count({room: room._id})
								.then(memberCount => {
									room.$memberCount = memberCount;
									return room;
								});
						});
					})
			);
		})

		// compose all the data into an object matching the original vars and return them to the client
		.spread((users, publicRooms) => {
			// don't return users who have not connected in the last 45 days
			users = _.filter(users, user => moment().diff(user.lastConnected, 'days') < 45);
			res.ok({user, userSettings, memberships, publicRooms, inbox, rooms, version, users})
		})
		.catch(res.serverError);
};

var version;
function codeVersion() {
	if (version) return Promise.resolve(version);

	fs.readdirAsync('./assets/bundled')
		.then.catch(_.noop)
}

// Activity update route. This will respond to PUT /user/current/activity
// This route only allows updates to present, typingIn, and room. It can only be called by the current user.
// Its purpose is to update state changes for the current user (which room are they typing in, are they away,
// which room is active, etc.)
module.exports.activity = function (req, res) {

	var userId = req.session.userId;

	// Only allow updates for the following values
	// There's no need for us to save these in the db, this may change in the future
	var typingIn = req.body.typingIn;
	var present = req.body.present;
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true
	};

	markLastReadMessage(req, updates);

	req.io.to(`user_${userId}`).emit('user', {_id: userId, verb: 'updated', data: updates});
	res.ok(updates);
};

function markLastReadMessage(req, updates) {
	var activeRoom = req.body.room;
	var userId = req.session.userId;

	if (!activeRoom) return;

	var lastMessageId;

	updates.activeRoom = activeRoom;

	User.findByIdAndUpdate(userId, {activeRoom: activeRoom})
		.then(user => {
			return Message.findOne({room: user.activeRoom}, {_id: 1}, {
				sort: {$natural: -1},
				limit: 1
			}).lean()
		})
		.then(lastMessage => {
			lastMessageId = (lastMessage || {})._id;

			return RoomMember.findOneAndUpdate(
				{user: userId, room: activeRoom},
				{lastReadMessage: lastMessageId});
		})
		.then(roomMember => {
			if (!roomMember) return;
			req.io.to(`userself_${userId}`).emit('user_roommember', {
				_id: roomMember._id,
				verb: 'updated',
				data: {lastReadMessage: lastMessageId}
			});
		})
		.catch(log.error);
}

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

module.exports.ping = function (req, res) {
	var userId = req.session.userId.toObjectId();

	// remove currently connected socket from array
	User.findByIdAndUpdate(userId,
		{
			$pull: {
				sockets: {socketId: req.socket.id}
			}
		}
	)
		.then(() => {
			return User.findByIdAndUpdate(userId,
				{
					$push: {
						sockets: {socketId: req.socket.id, updatedAt: new Date()}
					}
				}
			)
		})
		.then(() => res.ok())
		.catch(res.serverError);
};

// clear inactive users from list
setInterval(function () {
	var expiredSocketDate = moment().subtract(30, 'seconds').toDate();

	User.find({
		connected: true,
		$or: [
			{
				sockets: {
					$elemMatch: {
						updatedAt: {"$lte": expiredSocketDate}
					}
				}
			},
			{
				sockets: {$size: 0}
			}
		]
	})
		.then(users => {
			return Promise.each(users, user => {
				var sockets = _(user.sockets)
					.filter(socket => moment(socket.updatedAt).isBefore(expiredSocketDate))
					.map('socketId')
					.value();

				return userService.disconnectUser(user, sockets);
			});
		})
		.catch(log.error)
}, 10000);

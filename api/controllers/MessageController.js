/* global module, require, User, UserSettings, UserService, Message, Room, actionUtil */

/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

var moment = require('moment');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// POST /message
// Create a new message. We're overriding the blueprint route provided by sails in order to do
// some custom things.
exports.create = function (req, res) {
	var userId = req.session.userId;
	var roomId = req.param('room');

	// TODO if author is not a member of the roomId, cancel
	var text = sanitizeMessage(req.param('text'));
	if (!text || !text.length) {
		return res.badRequest();
	}
	else if (/^\/nick\s+/i.test(text)) { // Change the current user's nick

		var newNick = text.match(/\/nick\s+([\w\s-]{1,20})/i);
		if (newNick) {
			User.findOne(userId).exec(function (error, user) { // find the user in the db (don't want to use session version)
				var currentNick = user.nick;
				user.nick = newNick[1];
				user.save() // save the model with the updated nick
					.then(function () {
						User.publishUpdate(userId, {nick: user.nick});

						RoomMember.find().where({user: userId}).exec(function (err, roomMembers) {
							var rooms = _.pluck(roomMembers, 'room');
							RoomService.messageRooms(rooms, currentNick + ' changed their handle to ' + user.nick);
						});
					})
					.catch(function () {
						// TODO error handling
					});
			});
		}
		res.ok();
	}
	else if (/^\/topic/i.test(text)) { // Change room topic

		RoomMember.findOne({room: roomId, user: userId}).populate('user').exec(function (error, roomMember) {
			if (error) return res.serverError(error);
			if (!roomMember) return res.forbidden();

			if (roomMember.role == 'administrator' || roomMember.role == 'moderator') {

				var topicMatches = text.match(/\/topic\s+(.+)/i);
				var topic = topicMatches ? topicMatches[1].substr(0, 200) : null;

				Room.update(roomId, {topic: topic}).exec(function (error, room) {
					if (error) return res.serverError(error);
					if (!room) return res.notFound();

					var room = room[0];
					var message = topic ? roomMember.user.nick + ' changed the topic to ' + room.topic :
						roomMember.user.nick + ' cleared the topic';

					Room.publishUpdate(room.id, room);
					RoomService.messageRoom(roomId, message);

					res.ok();
				});
			}
			else {
				res.forbidden();
			}

		});
	}
	else { // base case, a regular chat message
		// Create a message model object in the db
		Message.create({ // the model to add into db
			room: roomId,
			author: userId,
			text: text
		}).exec(function (error, message) {
			res.ok(message); // send back the message to the original caller

			// now that message has been created, get the populated version
			Message.findOne(message.id).populateAll().exec(function (error, message) {
				Room.message(roomId, message); // message all subscribers of the room that with the new message as data
			});
		});
	}
};

// PUT /message/:id
// Update a message (the edit functionality)
exports.update = function (req, res) {
	var messageEditWindowSeconds = 30;
	var pk = actionUtil.requirePk(req);

	Message.findOne(pk).exec(function (error, message) {
		if (error) return res.serverError(error);
		if (!message) return res.notFound();

		// TODO use moment here
		var acceptableEditDate = new Date();
		acceptableEditDate.setSeconds(acceptableEditDate.getSeconds() - messageEditWindowSeconds);
		if (message.createdAt < acceptableEditDate) {
			return;
		}

		var updates = { // Only certain things are editable
			text: req.param('text'),
			history: req.param('history'),
			edited: true
		};

		Message.update(pk, updates).exec(function (error) {
			if (error) return res.serverError(error);

			// Have to repopulate in order to deliver a full message. This would typically not be necessarily
			// except we're informing clients of the update via the Room.message command, not a publishUpdate

			Message.findOne(pk).populateAll().exec(function (error, message) { // Repopulate
				// message all subscribers of the room that with the new message as data
				// this message is flagged with 'edited' so the client will know to perform an edit
				Room.message(message.room, message);
				res.ok(message);
			});
		});
	});
};

// GET /message/emoticons
exports.emoticonCounts = function (req, res) {
	// setting the request url as as the cache key
	cacheService.short.wrap('Message/emoticonCounts', lookup, done);

	function lookup(cacheLoadedCb) {
		var emoticonRegex = /:\w+:/g;
		var countMap = {};

		// .native gives you a callback function with a hook to the model's collection
		Message.native(function (err, messageCollection) {
			if (err) return cacheLoadedCb(err);

			messageCollection.find({text: {$regex: emoticonRegex}}).toArray(function (err, messages) {
				_.each(messages, function (message) {

					var matches = message.text.match(emoticonRegex);
					if (matches) {
						_.each(matches, function (match) {
							countMap[match] = countMap[match] ? countMap[match] + 1 : 1;
						});
					}
				});

				var emoticonCounts = _(countMap).map(function (value, key) {
					return {count: value, emoticon: key, name: key.replace(/:/g, '')};
				}).sortBy('count').reverse().value();

				cacheLoadedCb(err, emoticonCounts);
			});
		});
	}

	function done(err, messages) {
		res.ok(messages)
	}
};

// Sanitize a message, no tags allow currently
function sanitizeMessage(original) {
	return require('sanitize-html')(original, {
		allowedTags: []
	});
}

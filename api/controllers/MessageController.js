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
var ent = require('ent');

// POST /message
// Create a new message. We're overriding the blueprint route provided by sails in order to do
// some custom things.
exports.create = function (req, res) {
	var userId = req.session.userId;
	var roomId = req.param('room');

	// TODO if author is not a member of the roomId, cancel

	// block the trolls
	var text = ent.encode(req.param('text'));
	if (!text || !text.length) {
		return res.badRequest();
	}
	else if (/^\/nick\s+/i.test(text)) { // Change the current user's nick

		var newNick = text.match(/\/nick\s+([\w\s\-\.]{1,20})/i);
		if (newNick) {
			User.findOne(userId).exec(function (error, user) { // find the user in the db (don't want to use session version)
				var currentNick = user.nick;
				user.nick = newNick[1];
				user.save() // save the model with the updated nick
					.then(function () {
						User.publishUpdate(userId, {nick: user.nick});
						return RoomMember.find({user: userId});
					})
					.then(function (roomMembers) {
						var rooms = _.pluck(roomMembers, 'room');
						RoomService.messageRooms(rooms, currentNick + ' changed their handle to ' + user.nick);
					})
					.catch(function (error) {
						// TODO error handling
					});
			});
		}
		res.ok();
	}
	else if (/^\/help/i.test(text)) {

		return helpService.getHelp(text)
			.then(function (text) {
				RoomService.messageUserInRoom(userId, roomId, text);
				res.ok();
			});
	}
	else if (/^\/(up|down)\s+/i.test(text)) { // Karma system, unfinished

		var nickMatches = text.match(/^\/(?:up|down)\s+@?(\w+)/i);
		if (!nickMatches) return;
		var nick = nickMatches[1];
		var rating = text.match(/up/i) ? 1 : -1;

		// TODO would need to limit how many times a user can vote

		RoomMember.find().where({room: roomId}).populate('user').exec(function (error, roomMembers) {
			var matchingMember = _.find(roomMembers, function (roomMember) {
				return roomMember.user.nick == nick;
			});

			if (!matchingMember) return;

			if (typeof matchingMember.rating === 'undefined') {
				matchingMember.rating = 0;
			}

			matchingMember.rating += rating;
			// Not actually going to save right now as this is not completed
			//matchingMember.save();
			res.ok();
		});
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
					var message = roomMember.user.nick + (topic ? ' changed the topic to "' + topic + '"' : ' cleared the topic');

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
	else if (/^\/roll/i.test(text)) {
		var matches = text.match(/\/roll\s+(.+)/i);
		var roll = matches ? matches[1] : null;

		// Determine outcome
		var rollOutcome;

		if (_.isNumber(+roll) && !_.isNaN(+roll)) {
			var max = +roll;
			rollOutcome = 'rolled ' + Math.ceil(Math.random() * max) + ' out of ' + max;
		}
		// d20 case for D&D nerds
		//else if(/^d\d{1,4}/i.test(roll)) { // a dice roll
		//	rollOutcome = 'rolled a ' + roll + ' for ' + 100;
		//}
		else { // Doesn't fit any of our cases
			return;
		}

		User.findOne(userId).exec(function (error, user) {
			Message.create({
				room: roomId,
				author: null,
				text: user.nick + ' ' + rollOutcome
			}).exec(function (error, message) {
				res.ok(); // send back the message to the original caller
				broadcastMessage(message);
			});
		});
	}
	else if (/^\/me\s+/i.test(text)) {
		User.findOne(userId).exec(function (error, user) {
			Message.create({
				room: roomId,
				author: null,
				text: user.nick + text.substring(3)
			}).exec(function (error, message) {
				res.ok(message);
				broadcastMessage(message);
			})
		});
	}
	else {

		// base case, a regular chat message
		// Create a message model object in the db

		var message = {
			room: roomId,
			author: userId,
			text: text
		};

		Message.create(message)
			.then(function (message) {
				res.ok(message); // send back the message to the original caller
				broadcastMessage(message);
			})
			.catch(res.serverError)
	}
};

// PUT /message/:id
// Update a message (the edit functionality)
exports.update = function (req, res) {

	var messageEditWindowSeconds = 60;
	var pk = actionUtil.requirePk(req);

	Message.findOne(pk)
		.then(function (message) {

			if (moment(message.createdAt).isBefore(moment().subtract(messageEditWindowSeconds, 'seconds'))) {
				throw new Error('Edit window has past');
			}
			else if (message.edited) {
				throw new Error('Only one edit is allowed');
			}

			var updates = { // Only certain things are editable
				text: req.param('text'),
				history: req.param('history'),
				edited: true
			};

			return Message.update(pk, updates);
		})
		.then(function () {
			return Message.findOne(pk).populate('author');
		})
		.then(broadcastMessage)
		.then(res.ok)
		.catch(res.serverError);
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

function broadcastMessage(message) {
	// now that message has been created, get the populated version
	Message.findOne(message.id).populateAll().exec(function (error, message) {
		Room.message(message.room, message); // message all subscribers of the room that with the new message as data
	});
}

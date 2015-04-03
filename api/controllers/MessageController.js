/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var ent = require('ent');
var Promise = require('bluebird');

var ForbiddenError = require('../errors/ForbiddenError');
var InvalidInputError = require('../errors/InvalidInputError');

// POST /message
// Create a new message. We're overriding the blueprint route provided by sails in order to do
// some custom things.
exports.create = function (req, res) {

	var userId = req.session.userId;
	var roomId = req.param('room');

	RoomMember.findOne({user: userId, room: roomId}).populate('user').then(function (roomMember) {

		if (!roomMember) throw new ForbiddenError('Must be a member of this room');

		var user = roomMember.user;

		if (user.busy) {
			// User is flagged as busy, we can now remove this flag since they are interacting with the app
			User.update(user.id, {busy: false})
				.then(function () {
					User.publishUpdate(userId, {busy: false});
				});
		}

		// block the trolls
		var text = ent.encode(req.param('text'));
		if (!text || !text.length) {
			throw new InvalidInputError();
		}
		else if (/^\/nick\s+/i.test(text)) { // Change the current user's nick

			var nickMatches = text.match(/^\/nick\s+(\w[\w\s\-\.]{0,19})/i);
			if (!nickMatches) throw new InvalidInputError('Invalid nick');

			var newNick = nickMatches[1];
			if (user.nick == newNick) throw new InvalidInputError('Nick is already set');

			return Promise.all([
				User.update(user.id, {nick: newNick}),
				RoomMember.find({user: userId})
			])
				.spread(function (updatedUser, memberships) {
					updatedUser = updatedUser[0];
					User.publishUpdate(userId, {nick: updatedUser.nick});
					RoomService.messageRooms(_.pluck(memberships, 'room'), user.nick + ' changed their handle to ' + updatedUser.nick);
				});
		}
		// away, afk, busy (with optional message)
		else if (/^\/(away|afk|busy)/i.test(text)) {

			return Promise.all([
				User.findOne(userId),
				RoomMember.find({user: userId})
			])
				.spread(function (user, memberships) {
					return [User.update(userId, {busy: !user.busy}), memberships];
				})
				.spread(function (user, memberships) {
					user = user[0];

					var message = user.nick + ' is ' + (user.busy ? 'now away' : 'back');
					var awayMessageMatches = text.match(/^\/(?:away|afk|busy)\s*(.+)/i);
					if (user.busy && awayMessageMatches) {
						message += ': ' + awayMessageMatches[1];
					}

					// TODO let user supply some message
					RoomService.messageRooms(_.pluck(memberships, 'room'), message);
					User.publishUpdate(userId, {busy: user.busy});
				});
		}
		else if (/^\/help/i.test(text)) {

			// TODO doesn't seem to work in prod?
			return helpService.getHelp(text).then(function (text) {
				RoomService.messageUserInRoom(userId, roomId, text);
			});
		}
		else if (/^\/topic/i.test(text)) { // Change room topic

			if (roomMember.role == 'member') {
				throw new ForbiddenError('Must be an administrator to change topic');
			}

			var topicMatches = text.match(/\/topic\s+(.+)/i);
			var topic = topicMatches ? topicMatches[1].substr(0, 200) : null;

			return Room.update(roomId, {topic: topic}).then(function (room) {
				room = room[0];
				var message = user.nick + (topic ? ' changed the topic to "' + topic + '"' : ' cleared the topic');

				Room.publishUpdate(room.id, room);
				RoomService.messageRoom(roomId, message);
			});
		}
		// Jordan's Magic 8 Ball, Bitches
		else if (/^\/magic8ball/i.test(text)) {

			var ballResponse = _.sample([
				"It is certain", "It is decidedly so", "Yes definitely",
				"You may rely on it", "As I see, yes",
				"Most likely", "Outlook good", "Yes", "Signs point to yes", "Without a doubt",
				"Ask again later", "Better not to tell you now",
				"Cannot predict now", "Concentrate and ask again", "Reply hazy, try again",
				"Don't count on it", "My reply is no",
				"My sources say no", "Outlook not so good", "Very doubtful"
			]);

			return Message.create({
				room: roomId,
				author: null,
				text: user.nick + ' shakes the magic 8 ball: "' + ballResponse + '".'
			}).then(function (message) {
				broadcastMessage(message);
				return message;
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

			return Message.create({
				room: roomId,
				author: null,
				text: user.nick + ' ' + rollOutcome
			}).then(function (message) {
				broadcastMessage(message);
				return message;
			});
		}
		else if (/^\/me\s+/i.test(text)) {

			return Message.create({
				room: roomId,
				author: null,
				text: user.nick + text.substring(3)
			}).then(function (message) {
				broadcastMessage(message);
				return message;
			});
		}
		else {

			// base case, a regular chat message
			// Create a message model object in the db

			return Message.create({
				room: roomId,
				author: userId,
				text: text
			}).then(function (message) {
				broadcastMessage(message);
				return message;
			});
		}
	})
		.then(res.ok)
		.catch(ForbiddenError, function (err) {
			res.forbidden(err);
		})
		.catch(InvalidInputError, function (err) {
			res.badRequest(err);
		})
		.catch(res.serverError);
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

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

// Create a new message, this will be the endpoint for POST /message
module.exports.create = function (req, res) {
	var author = req.session.user;
	var roomId = req.body.room;

	// TODO if author is not a member of the roomId, cancel
	var text = sanitizeMessage(req.body.text);
	if (!text || !text.length) {
		return res.badRequest();
	}
	else if (/^\/me\s+/i.test(text)) {
		// /me emote command
		// Pete's code zone, do not enter
		// ******************************
	}
	else if (/^\/nick\s+/i.test(text)) {
		var newNick = text.match(/\/nick\s+([\w\s-]{1,20})/i);
		if (newNick) {
			User.findOne(author.id).populate('rooms').exec(function (error, user) { // find the user in the db (don't want to use session version)
				var currentNick = user.nick;
				user.nick = newNick[1];
				user.save() // save the model with the updated nick
					.then(function () {
						User.publishUpdate(user.id, {nick: user.nick});
						RoomService.messageRooms(user.rooms, currentNick + ' changed their handle to ' + user.nick);
					})
					.catch(function () {
						// TODO error handling
					});
			});
		}
		res.ok();
	}
	else if (/^\/topic\s+/i.test(text)) {
		// topic command
	}
	else if (/^\/settings\s+/i.test(text)) {
		// Command syntax: /settings target verb newValue
		//   Verb can be set or get. Set requires a newValue.

		var commandSyntaxText = 'Syntax: /settings targetSetting get/set setToValue';

		var command = text.split(' ');
		var targetSetting = command[1];
		var verb = command[2];

		if (command.length > 2 && targetSetting && verb) {
			if (verb.toLowerCase() === 'get' && command.length === 3) {
				// TODO: It'd be nice to have a way to get a list of all settings and their values. I will do this one day. -weeg

				UserSettings.findOne({ user: author.id }).exec(function (error, userSettings) {
					if (targetSetting !== 'createdAt' && // Line 58-61, we don't want to expose db specific shit.
						targetSetting !== 'updatedAt' &&
						targetSetting !== 'id' &&
						targetSetting !== 'user' &&
						targetSetting in userSettings) {
						UserService.sendUserSpecificMessage(author, targetSetting + ' = ' + userSettings[targetSetting]);
					} else {
						UserService.sendUserSpecificMessage(author, 'Setting does not exist.');
					}
				});
			} else if (verb.toLowerCase() === 'set' && command.length === 4) {
				var updates = {};
				updates[targetSetting] = command[3];

				UserSettings.update({ user: author.id }, updates).exec(function (error, userSettings) {
					if (targetSetting in userSettings[0]) {
						UserService.sendUserSpecificMessage(author, targetSetting + ' = ' + userSettings[0][targetSetting]);
					} else {
						UserService.sendUserSpecificMessage(author, 'Setting does not exist.');
					}
				});
			}
			else {
				UserService.sendUserSpecificMessage(author, commandSyntaxText);
			}
		} else {
			UserService.sendUserSpecificMessage(author, commandSyntaxText);
		}
	}
	else if (/^\/.*/i.test(text)) {
		// Unknown slash command response.

		var possibleCommandsText = 'Possible commands: /me /nick /settings /topic';

		UserService.sendUserSpecificMessage(author, possibleCommandsText);
	}
	else { // base case, a regular chat message

		// Create a message model object in the db
		Message.create({ // the model to add into db
			room: roomId,
			author: author.id,
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

module.exports.update = function (req, res) {
	var messageEditWindowSeconds = 10;
	var pk = actionUtil.requirePk(req);

	Message.findOne(pk).exec(function (error, message) {
		if (error) return res.serverError(error);
		if (!message) return res.notFound();

		var acceptableEditDate = new Date();
		acceptableEditDate.setSeconds(acceptableEditDate.getSeconds() - messageEditWindowSeconds);
		if (message.createdAt < acceptableEditDate) {
			return;
		}
		Message.update({id: pk}, req.body).exec(function () {

			// message all subscribers of the room that with the new message as data
			// this message is flagged with 'edited' so the client will know to perform an edit
			Room.message(req.body.room, req.body);

			res.ok(req.body);
		});
	});
};

// Get the latest 50 messages, this will be the endpoint for GET /message/latest
module.exports.latest = function (req, res) {
	var roomId = req.param('roomId');
	var user = req.session.user;
	// TODO check for roomId and user values

	// find finds multiple instances of a model, using the where criteria (in this case the roomId
	// we also want to sort in DESCing (latest) order and limit to 50
	// populateAll hydrates all of the associations
	Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, messages) {
		res.ok(messages); // send the messages
	});
};

// Sanitize a message, no tags allow currently
function sanitizeMessage(original) {
	return require('sanitize-html')(original, {
		allowedTags: []
	});
}

module.exports.history = function (req, res) {
	var roomId = req.param('roomId');
	var startDate = req.param('startDate');
	var endDate = req.param('endDate');

	Message.find({room: roomId, createdAt: {'>': moment(startDate).toDate(), '<': moment(endDate).toDate()}})
		.populate('author')
		.exec(function (err, messages) {
			if (err) return res.serverError(err);
			res.ok(messages);
		})
};

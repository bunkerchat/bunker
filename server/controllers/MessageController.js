/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var ForbiddenError = require('../errors/ForbiddenError');
var Message = require('../models/Message');
var messageService = require('../services/messageService');

// PUT /message/:id
// Update a message (the edit functionality)
exports.update = function (req, res) {
	var messageUpdate = req.body.message;
	var messageId = messageUpdate._id.toObjectId();
	var userId = req.session.userId;

	Message.findById(messageId)
		.populate('author')
		.then(function (dbMessage) {
			if (userId != dbMessage.author._id.toString()) {
				throw new ForbiddenError('Only the author may edit their message');
			}

			// TODO
			//if (message.author.busy) {
			//	// User is flagged as busy, we can now remove this flag since they are interacting with the app
			//	User.update(userId, {busy: false}).exec(function (err, users) {
			//	});
			//}
			//		User.publishUpdate(userId, {busy: false, typingIn: null});

			// Only certain things are editable
			var updates = {
				text: messageUpdate.text,
				edited: true,
				editCount: dbMessage.editCount + 1
			};

			return Message.findByIdAndUpdate(messageId, updates);
		})
		.then(function () {
			return Message.findById(messageId).populate('author').lean();
		})
		.then(messageService.broadcastMessage)
		.then(res.ok)
		.catch(ForbiddenError, function (err) {
			res.forbidden(err);
		})
		.catch(res.serverError);
};

// GET /message/emoticons
exports.emoticonCounts = function (req, res) {
	emoticonService.emoticonCounts()
		.then(res.ok)
		.catch(res.serverError);
};

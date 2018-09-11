/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var ForbiddenError = require('../errors/ForbiddenError');
var Message = require('../models/Message');
var User = require('../models/User');
var messageService = require('../services/messageService');
var emoticonService = require('../services/emoticonService');
const reactionService = require('../services/reactionService');

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

			// Inform clients that use is not busy and typing has ceased
			var notTypingUpdate = {busy: false, typingIn: null, connected: true};
			User.findByIdAndUpdate(userId, notTypingUpdate).exec();
			req.io.to('user_' + userId).emit('user', {_id: userId, verb: 'updated', data: notTypingUpdate});

			// Only certain things are editable
			var updates = {
				text: messageUpdate.text,
				edited: true,
				editCount: dbMessage.editCount + 1
			};

			return Message.findByIdAndUpdate(messageId, updates);
		})
		.then(function () {
			return Message.findById(messageId).populate('author reactions').lean();
		})
		.then(messageService.broadcastMessage)
		.then(res.ok)
		.catch(ForbiddenError, function (err) {
			res.forbidden(err);
		})
		.catch(res.serverError);
};

exports.toggleReaction = (req, res) => {
	const userId = req.session.userId;
	return Message.findById(req.body.messageId)
		.populate('author')
		.then(function (dbMessage) {
			return reactionService.toggleReaction(dbMessage._id, userId, req.body.emoticonName);
		})
		.then(function () {
			return Message.findById(req.body.messageId).populate('author reactions').lean();
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

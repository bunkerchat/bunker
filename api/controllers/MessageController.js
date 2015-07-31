/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var ForbiddenError = require('../errors/ForbiddenError');

// PUT /message/:id
// Update a message (the edit functionality)
exports.update = function (req, res) {

	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Message.findOne(pk).populate('author')
		.then(function (message) {

			if (userId != message.author.id) {
				throw new ForbiddenError('Only the author may edit their message');
			}

			if (message.author.busy) {
				// User is flagged as busy, we can now remove this flag since they are interacting with the app
				User.update(userId, {busy: false}).exec(function (err, users) {
				});
			}

			User.publishUpdate(userId, {busy: false, typingIn: null});

			var updates = { // Only certain things are editable
				text: req.param('text'),
				history: req.param('history'),
				edited: true,
				editCount: message.editCount + 1
			};

			return Message.update(pk, updates);
		})
		.then(function () {
			return Message.findOne(pk).populate('author');
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

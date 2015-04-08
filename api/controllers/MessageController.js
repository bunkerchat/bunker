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

	var messageEditWindowSeconds = 60;
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Message.findOne(pk).populate('author')
		.then(function (message) {

			if (userId != message.author.id) {
				throw new ForbiddenError('Only the author may edit their message');
			}
			if (moment(message.createdAt).isBefore(moment().subtract(messageEditWindowSeconds, 'seconds'))) {
				throw new Error('Edit window has past');
			}
			if (message.edited) {
				throw new Error('Only one edit is allowed');
			}

			if (message.author.busy) {
				// User is flagged as busy, we can now remove this flag since they are interacting with the app
				User.update(userId, {busy: false}).exec();
			}

			User.publishUpdate(userId, {busy: false, typingIn: null});

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
		.then(messageService.broadcastMessage)
		.then(res.ok)
		.catch(ForbiddenError, function (err) {
			res.forbidden(err);
		})
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

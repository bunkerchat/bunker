var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var cacheService = require('./cacheService');
var Message = require('../models/Message');
var User = require('../models/User');

module.exports.emoticonCounts = function () {
	return new Promise(function (resolve, reject) {
		// setting the request url as as the cache key
		cacheService.fourHours.wrap('Message/emoticonCounts', lookup, done);

		function lookup(cacheLoadedCb) {
			var emoticonRegex = /:\w+:/g;
			var countMap = {};

			Message.find({text: {$regex: emoticonRegex}})
				.limit(10000)
				.then(messages => {
					_.each(messages, message => {
						var match = message.text.match(emoticonRegex);

						// Create total count for this emoticon
						if (!countMap[match]) {
							countMap[match] = {count: 0};
						}
						countMap[match].count++;

						// Create object of usedBy counts for this emoticon
						if (message.author) {
							if (!countMap[match][message.author]) {
								countMap[match][message.author] = 0;
							}
							countMap[match][message.author]++;
						}
					})
				})
				.then(() => {
					// Map into a nice sorted object
					var emoticonCounts = _(countMap)
						.map(function (value, key) {
							return {
								count: value.count,
								emoticon: key,
								name: key.replace(/:/g, ''),
								usedBy: _.omit(value, 'count')
							};
						})
						.sortBy('count')
						.reverse()
						.value();

					// Replace the id's in the userBy section with nick + id
					return User.find({})
						.then(function (users) {
							var userHash = {};

							_.each(users, function (user) {
								userHash[user._id.toString()] = user;
							});

							_.each(emoticonCounts, function (count) {
								_.each(count.usedBy, function (usedByCount, id) {
									var user = userHash[id];
									count.usedBy[user.nick + ' (' + id + ')'] = usedByCount;
									delete count.usedBy[id];
								});
							});

							return emoticonCounts;
						});
				})
				.nodeify(cacheLoadedCb);
		}

		function done(err, emoticonCounts) {
			if (err) return reject(err);
			resolve(emoticonCounts);
		}
	});
};

module.exports.getEmoticonNamesFromDisk = function () {
	return fs.readdirAsync('./assets/images/emoticons');
};

module.exports.getLoadScreenEmoticon = function () {
	return _.sample([
		'argh.gif',
		'bang.gif',
		'banjo.gif',
		'canofworms.gif',
		'clint.gif',
		'cop.gif',
		'cthulhu.gif',
		'dance.gif',
		'drinkup.gif',
		'duckhunt.gif',
		'f5.gif',
		'frogcool.gif',
		'golfclap.gif',
		'ghost.gif',
		'lightsabers.gif',
		'metal.gif',
		'munch.gif',
		'ninja.gif',
		'nyan.gif',
		'rant.gif',
		'rolldice.gif',
		'science.gif',
		'woop.gif',
		'words.gif'
	]);
};

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var cacheService = require('./cacheService');

module.exports.emoticonCounts = function () {
	return new Promise(function (resolve, reject) {
		//HACK: fix this
		return resolve([]);


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
							});
						}
					});

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
					User.find().then(function (users) {

						_.each(emoticonCounts, function (count) {
							_.each(count.usedBy, function (usedByCount, id) {
								var user = _.find(users, {_id: id});
								count.usedBy[user.nick + ' (' + id + ')'] = usedByCount;
								delete count.usedBy[id];
							});
						});

						cacheLoadedCb(err, emoticonCounts);
					})
						.catch(reject);
				});
			});
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

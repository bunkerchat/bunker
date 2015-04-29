var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports.emoticonCounts = function () {
	return new Promise(function (resolve, reject) {
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

		function done(err, emoticonCounts) {
			if(err) return reject(err);
			resolve(emoticonCounts);
		}
	});
};

module.exports.getEmoticonNamesFromDisk = function () {
	return fs.readdirAsync(path.join(__dirname, '..', '..', 'assets', 'images', 'emoticons'));
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
}
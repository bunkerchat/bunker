const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));

const cacheService = require("./cacheService");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports.emoticonCounts = function() {
	const key = "Message/emoticonCounts";

	return cacheService.fourHours
		.getAsync(key)
		.then(result => result || lookup())
		.then(JSON.parse);

	function lookup() {
		const emoticonRegex = /:\w+:/;
		const countMap = {};

		return (
			Message.find({ text: { $regex: emoticonRegex } })
				.sort({ createdAt: -1 })
				.limit(10000)
				.then(messages => {
					_.each(messages, message => {
						const match = message.text.match(emoticonRegex);

						// Create total count for this emoticon
						if (!countMap[match]) {
							countMap[match] = { count: 0 };
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
				})
				.then(() => {
					// Map into a nice sorted object
					const emoticonCounts = _(countMap)
						.map((value, key) => {
							return {
								count: value.count,
								emoticon: key,
								name: key.replace(/:/g, ""),
								usedBy: _.omit(value, "count")
							};
						})
						.sortBy("count")
						.reverse()
						.value();

					// Replace the id's in the userBy section with nick + id
					return User.find({}).then(users => {
						const userHash = {};

						_.each(users, user => {
							userHash[user._id.toString()] = user;
						});

						_.each(emoticonCounts, count => {
							_.each(count.usedBy, function(usedByCount, id) {
								const user = userHash[id];
								count.usedBy[user.nick + " (" + id + ")"] = usedByCount;
								delete count.usedBy[id];
							});
						});

						return emoticonCounts;
					});
				})
				// stringify for mongo cache
				.then(JSON.stringify)
				.then(results => cacheService.fourHours.setAsync(key, results))
		);
	}
};

let emoticonCache;

module.exports.getEmoticonNamesFromDisk = function() {
	if (emoticonCache) return Promise.resolve(emoticonCache);

	return Promise.join(
		// Image emoticons
		fs.readdirAsync("./assets/images/emoticons"),
		// Font-Awesome icons (read from the .css file)
		fs.readFileAsync("./node_modules/font-awesome/css/font-awesome.css", { encoding: "utf8" }).then(data => {
			return data.match(/\.fa-([a-z\-]+):before/g).map(icon => {
				return icon.replace(":before", "").replace(".fa", "fa");
			});
		})
	).spread((emoticons, icons) => {
		emoticonCache = _.sortBy(emoticons.concat(icons));
		return emoticonCache;
	});
};

module.exports.getLoadScreenEmoticon = function() {
	return _.sample([
		"argh.gif",
		"bang.gif",
		"banjo.gif",
		"canofworms.gif",
		"clint.gif",
		"cop.gif",
		"cthulhu.gif",
		"dance.gif",
		"drinkup.gif",
		"duckhunt.gif",
		"f5.gif",
		"frogcool.gif",
		"golfclap.gif",
		"ghost.gif",
		"lightsabers.gif",
		"metal.gif",
		"munch.gif",
		"ninja.gif",
		"nyan.gif",
		"rant.gif",
		"rolldice.gif",
		"science.gif",
		"woop.gif",
		"words.gif",
		"heartstare.gif",
		"angel.gif",
		"toot.png"
	]);
};

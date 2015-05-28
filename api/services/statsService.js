var Promise = require('bluebird');
var moment = require('moment');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var ent = require('ent');
var ObjectId = require('mongodb').ObjectID;

module.exports.getStats = function (roomMember) {

	return Message.count({author: roomMember.user.id})
		.then(function (messageCount) {
			return Promise.join(
				fs.readFileAsync(path.join(__dirname, 'statsTemplate.ejs')),
				messageCount,
				Message.count({author: roomMember.user.id, edited: true}),
				Message.find({author: roomMember.user.id}).sort('createdAt ASC').limit(1),
				Message.find({author: roomMember.user.id}).skip(_.random(0, messageCount)).limit(1),
				getEmoticonCounts(roomMember)
			)
				.spread(function (template, messageCount, editCount, firstMessage, randomMessage, emoticonCounts) {
					firstMessage = firstMessage[0];
					randomMessage = randomMessage[0];

					var data = {
						user: roomMember.user.nick,
						messageCount: messageCount,
						editCount: editCount,
						startDate: formatDateTime(roomMember.user.createdAt),
						totalDays: moment().diff(roomMember.user.createdAt, 'days'),
						activeDays: 'WORK IN PROGRESS',
						firstMessage: '"' + ent.decode(firstMessage.text) + '" (' + formatDateTime(firstMessage.createdAt) + ')',
						emotes: ent.decode(_.pluck(emoticonCounts, 'emoticon').join(' ')),
						randomMessage: '"' + ent.decode(randomMessage.text) +'" (' +  formatDateTime(randomMessage.createdAt) + ')'
					};
					return ent.encode(_.template(template)(data));
				});
		});
};

function formatDateTime(dateTime){
	return new moment(dateTime).format('dddd, MMMM Do YYYY, h:mm:ss a')
}

function getEmoticonCounts(roomMember) {
	var emoticonRegex = /:\w+:/g;
	var countMap = {};

	return new Promise(function (resolve) {
		Message.native(function (err, messageCollection) {
			messageCollection.find({author: new ObjectId(roomMember.user.id), text: {$regex: emoticonRegex}})
				.toArray(function (err, messages) {
					_.each(messages, function (message) {

						var matches = _.unique(message.text.match(emoticonRegex));
						if (matches) {
							_.each(matches, function (match) {
								countMap[match] = countMap[match] ? countMap[match] + 1 : 1;
							});
						}
					});

					var counts = _(countMap)
						.map(function (value, key) {
							return {count: value, emoticon: key, name: key.replace(/:/g, '')};
						})
						.sortBy('count')
						.reverse()
						.take(10)
						.value();

					resolve(counts);
				});
		});
	});
}

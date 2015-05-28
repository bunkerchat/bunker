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
				getActiveDays(roomMember),
				Message.find({author: roomMember.user.id}).sort('createdAt ASC').limit(1),
				Message.find({author: roomMember.user.id}).skip(_.random(0, messageCount)).limit(1),
				getEmoticonCounts(roomMember)
			)
				.spread(function (template, messageCount, editCount, activeDays, firstMessage, randomMessage, emoticonCounts) {

					var mostActiveDayObject = _.first(activeDays);
					var mostActiveYear = mostActiveDayObject._id.year;
					var mostActiveDayOfYear = mostActiveDayObject._id.dayOfYear;
					var mostActiveDay = moment().year(mostActiveYear).dayOfYear(mostActiveDayOfYear);
					var dateFormat = 'MMMM D, YYYY';
					var dateTimeFormat = 'MMMM D, YYYY h:mma';

					var data = {
						user: roomMember.user.nick,
						messageCount: messageCount,
						editCount: editCount,
						startDate: moment(roomMember.user.createdAt).format(dateFormat),
						activeDate: mostActiveDay.format(dateFormat) + ' (' + mostActiveDayObject.count + ' messages)',
						totalDays: moment().diff(roomMember.user.createdAt, 'days'),
						activeDays: activeDays.length,
						firstMessage: '"' + ent.decode(firstMessage[0].text) + '" (' + moment(firstMessage.createdAt).format(dateTimeFormat) + ')',
						emotes: ent.decode(_.pluck(emoticonCounts, 'emoticon').join(' ')),
						randomMessage: '"' + ent.decode(randomMessage[0].text) + '" (' + moment(randomMessage.createdAt).format(dateTimeFormat) + ')'
					};
					return ent.encode(_.template(template)(data));
				});
		});
};

function getActiveDays(roomMember) {
	return new Promise(function (resolve) {
		Message.native(function (err, messageCollection) {
			messageCollection.aggregate([
				{
					$match: {
						author: new ObjectId(roomMember.user.id)
					}
				},
				{
					$group: {
						_id: {
							year: {$year: '$createdAt'},
							dayOfYear: {$dayOfYear: '$createdAt'}
						},
						count: {$sum: 1}
					}
				},
				{
					$sort: {count: -1}
				}
			], function (err, daysWithMessages) {
				resolve(daysWithMessages);
			});
		});
	});
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

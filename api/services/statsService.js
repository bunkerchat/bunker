var Promise = require('bluebird');
var moment = require('moment');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var ent = require('ent');
var ObjectId = require('mongodb').ObjectID;

module.exports.getStats = function (roomMember) {
	return generateStats(roomMember, 'statsForSelfTemplate.ejs');
};

module.exports.getStatsForUser = function (username, roomId) {
	return RoomService.getRoomMemberByNickAndRoom(username, roomId)
		.then(function (roomMember) {
			if (!roomMember) throw new Error('User not found');
			return generateStats(roomMember, 'statsForUserTemplate.ejs');
		});
};

function generateStats(roomMember, template) {
	return Message.count({author: roomMember.user.id})
		.then(function (messageCount) {
			return Promise.join(
				fs.readFileAsync(path.join(__dirname, template)),
				messageCount,
				Message.count({author: roomMember.user.id, edited: true}),
				getActiveDays(roomMember),
				Message.find({author: roomMember.user.id}).sort('createdAt ASC').limit(1),
				Message.find({author: roomMember.user.id}).skip(_.random(0, messageCount)).limit(1),
				getEmoticonCounts(roomMember),
				getHangmanStats(roomMember.user.id)
			)
				.spread(function (template, messageCount, editCount, activeDays, firstMessage, randomMessage, emoticonCounts, hangmanStats) {
					firstMessage = firstMessage[0];
					randomMessage = randomMessage[0];

					var dateFormat = 'dddd MMMM Do, YYYY';
					var dateTimeFormat = 'dddd MMMM Do, YYYY @ h:mm:ssa';

					var averageCountPerDay = 0;

					if (messageCount && activeDays.length) {
						averageCountPerDay = messageCount / activeDays.length;
					}

					var data = {
						user: roomMember.user.nick,
						messageCount: messageCount,
						averageMessageCountPerDay: ~~averageCountPerDay,
						editCount: editCount,
						startDate: moment(roomMember.user.createdAt).format(dateFormat),
						totalDays: moment().diff(roomMember.user.createdAt, 'days'),
						activeDays: activeDays.length,
						firstMessage: '"' + ent.decode(firstMessage.text) + '" (' + moment(firstMessage.createdAt).format(dateTimeFormat) + ')',
						emotes: ent.decode(_.pluck(emoticonCounts, 'emoticon').join(' ')),
						randomMessage: '"' + ent.decode(randomMessage.text) + '" (' + moment(randomMessage.createdAt).format(dateTimeFormat) + ')',
						hangmanGuessCount: hangmanStats.count,
						hangmanGuessAccuracy: hangmanStats.guessAccuracy + '%'
					};

					if (activeDays) {
						var mostActive = makeActiveModel(activeDays);

						var activeDaysSorted = _(activeDays)
							.sortByAll([
								function (day) {
									return day._id.year;
								},
								function (day) {
									return day._id.dayOfYear;
								}
							])
							.reverse()
							.value();

						var lastActive = makeActiveModel(activeDaysSorted);

						data.activeDate = mostActive.day.format(dateFormat) + ' (' + mostActive.object.count + ' messages)';
						data.lastActiveDate = lastActive.day.format(dateFormat) + ' (' + lastActive.object.count + ' messages)';
					}

					return ent.encode(_.template(template)(data));
				});
		});
}

function makeActiveModel(activeDays) {
	if (!activeDays) return;

	var mostActiveDayObject = _.first(activeDays);
	var mostActiveYear = mostActiveDayObject._id.year;
	var mostActiveDayOfYear = mostActiveDayObject._id.dayOfYear;
	var mostActiveDay = moment().year(mostActiveYear).dayOfYear(mostActiveDayOfYear);

	return {
		object: mostActiveDayObject,
		year: mostActiveYear,
		dayOfYear: mostActiveDayOfYear,
		day: mostActiveDay
	}
}

function getActiveDays(roomMember) {
	return new Promise(function (resolve, reject) {
		Message.native(function (err, messageCollection) {
			if (err) return reject(err);
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
				if (err) return reject(err);
				resolve(daysWithMessages);
			});
		});
	});
}

function getEmoticonCounts(roomMember) {
	var emoticonRegex = /:\w+:/g;
	var countMap = {};

	return new Promise(function (resolve, reject) {
		Message.native(function (err, messageCollection) {
			if (err) return reject(err);

			messageCollection.find({author: new ObjectId(roomMember.user.id), text: {$regex: emoticonRegex}})
				.toArray(function (err, messages) {
					if (err) return reject(err);
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

function getHangmanStats(userId) {
	return HangmanUserStatistics.findOne({user: userId}).then(function (hangmanUserStatistics) {
		var stats = {count: 0, guessAccuracy: 0};
		if (!hangmanUserStatistics) return stats;

		stats.count = hangmanUserStatistics.guessMisses + hangmanUserStatistics.guessHits;

		if (!stats.count || !hangmanUserStatistics.guessHits) return stats;

		stats.guessAccuracy = Math.round((hangmanUserStatistics.guessHits / stats.count) * 100);

		return stats;
	});
}

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
	// find all users with that nick
	return User.find({nick: username})
		.then(function (users) {
			var userIds = users.map(function (user) {
				return user.id;
			});

			// get roommember with that nick and roomId
			return RoomMember.findOne({user: userIds, room: roomId}).populateAll();
		})
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
				getEmoticonCounts(roomMember)
			)
				.spread(function (template, messageCount, editCount, activeDays, firstMessage, randomMessage, emoticonCounts) {
					firstMessage = firstMessage[0];
					randomMessage = randomMessage[0];

					var dateFormat = 'dddd MMMM Do, YYYY';
					var dateTimeFormat = 'dddd MMMM Do, YYYY @ h:mm:ssa';

					var data = {
						user: roomMember.user.nick,
						messageCount: messageCount,
						editCount: editCount,
						startDate: moment(roomMember.user.createdAt).format(dateFormat),
						totalDays: moment().diff(roomMember.user.createdAt, 'days'),
						activeDays: activeDays.length,
						firstMessage: '"' + ent.decode(firstMessage.text) + '" (' + moment(firstMessage.createdAt).format(dateTimeFormat) + ')',
						emotes: ent.decode(_.pluck(emoticonCounts, 'emoticon').join(' ')),
						randomMessage: '"' + ent.decode(randomMessage.text) + '" (' + moment(randomMessage.createdAt).format(dateTimeFormat) + ')'
					};

					if(activeDays){
						var mostActive = makeActiveModel(activeDays);

						var activeDaysSorted = _.sortByAll(activeDays, [
							function (day) {
								return day._id.year;
							},
							function (day) {
								return day._id.dayOfYear;
							}
						]);

						var lastActive = makeActiveModel(activeDaysSorted);

						data.activeDate = mostActive.day.format(dateFormat) + ' (' + mostActive.object.count + ' messages)';
						data.lastActiveDate = lastActive.day.format(dateFormat) + ' (' + lastActive.object.count + ' messages)';
					}

					return ent.encode(_.template(template)(data));
				});
		});
}

function makeActiveModel(activeDays){
	if(!activeDays) return;

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

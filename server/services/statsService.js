var Promise = require('bluebird');
var moment = require('moment');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var ent = require('ent');
var ObjectId = require('mongodb').ObjectID;

var RoomService = require('../services/RoomService');
var User = require('../models/User');
var Message = require('../models/Message');
var Fight = require('../models/Fight');
var FightRound = require('../models/FightRound');
var HangmanPublicGameStatistics = require('../models/HangmanPublicGameStatistics');
var HangmanUserStatistics = require('../models/HangmanUserStatistics');

module.exports.getStats = function (roomMember) {
	return generateStats(roomMember, './templates/statsForSelfTemplate.ejs');
};

module.exports.getStatsForUser = function (username, roomId) {
	return RoomService.getRoomMemberByNickAndRoom(username, roomId)
		.then(function (roomMember) {
			if (!roomMember) throw new Error('User not found');
			return generateStats(roomMember, './templates/statsForUserTemplate.ejs');
		});
};

function generateStats(roomMember, template) {
	return Message.count({author: roomMember.user._id})
		.then(function (messageCount) {
			return Promise.join(
				fs.readFileAsync(path.join(__dirname, template)),
				messageCount,
				Message.count({author: roomMember.user._id, edited: true}),
				getActiveDays(roomMember),
				Message.find({author: roomMember.user._id, type: 'standard'}).sort('createdAt ASC').limit(1),
				Message.find({author: roomMember.user._id, type: 'standard'}).skip(_.random(0, messageCount)).limit(1),
				getEmoticonCounts(roomMember),
				getHangmanStats(roomMember.user._id),
				getFightStatistics(roomMember.user._id)
			)
				.spread(function (template, messageCount, editCount, activeDays, firstMessage, randomMessage, emoticonCounts, hangmanStats, fightStats) {
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
						firstMessage: firstMessage ? '"' + ent.decode(firstMessage.text) + '" (' + moment(firstMessage.createdAt).format(dateTimeFormat) + ')' : '',
						emotes: ent.decode(_.map(emoticonCounts, 'emoticon').join(' ')),
						randomMessage: randomMessage ? '"' + ent.decode(randomMessage.text) + '" (' + moment(randomMessage.createdAt).format(dateTimeFormat) + ')' : '',
						hangmanGuessCount: hangmanStats.count,
						hangmanGuessAccuracy: hangmanStats.guessAccuracy ? hangmanStats.guessAccuracy + '%' : 'N/A',
						hangmanPrivateWinLoss: (hangmanStats.privateWins ? hangmanStats.privateWins : 0) + ' - ' + (hangmanStats.privateLosses ? hangmanStats.privateLosses : 0),
						hangmanPublicWinLoss: hangmanStats.publicWins + ' - ' + hangmanStats.publicLosses,
						fightWinPercentage: fightStats.fightWinPercentage,
						fightRoundWinPercentage: fightStats.fightRoundWinPercentage,
						fightVictim1: fightStats.topVictims && fightStats.topVictims[0] ? fightStats.topVictims[0].userNick + " " + fightStats.topVictims[0].beatings : '',
						fightVictim2: fightStats.topVictims && fightStats.topVictims[1] ? fightStats.topVictims[1].userNick + " " + fightStats.topVictims[1].beatings : '',
						fightVictim3: fightStats.topVictims && fightStats.topVictims[2] ? fightStats.topVictims[2].userNick + " " + fightStats.topVictims[2].beatings : '',
						fightVictim4: fightStats.topVictims && fightStats.topVictims[3] ? fightStats.topVictims[3].userNick + " " + fightStats.topVictims[3].beatings : '',
						fightVictim5: fightStats.topVictims && fightStats.topVictims[4] ? fightStats.topVictims[4].userNick + " " + fightStats.topVictims[4].beatings : ''
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
	};
}

function getActiveDays(roomMember) {
	return Message.aggregate([
		{$match: {author: new ObjectId(roomMember.user._id)}},
		{
			$group: {
				_id: {
					year: {$year: '$createdAt'},
					dayOfYear: {$dayOfYear: '$createdAt'}
				},
				count: {$sum: 1}
			}
		},
		{$sort: {count: -1}}
	]).exec();
}

function getEmoticonCounts(roomMember) {
	var emoticonRegex = /:\w+:/g;
	var countMap = {};

	return Message.find({
		author: new ObjectId(roomMember.user._id),
		text: {$regex: emoticonRegex}
	}).then(function (messages) {

		_.each(messages, function (message) {

			var matches = _.uniq(message.text.match(emoticonRegex));
			if (matches) {
				_.each(matches, function (match) {
					countMap[match] = countMap[match] ? countMap[match] + 1 : 1;
				});
			}
		});

		return _(countMap)
			.map(function (value, key) {
				return {count: value, emoticon: key, name: key.replace(/:/g, '')};
			})
			.sortBy('count')
			.reverse()
			.take(10)
			.value();
	});
}

function getHangmanStats(userId) {
	return Promise.join(
		getHangmanUserStatistics(userId),
		getHangmanPublicStatistics()
	)
		.spread(function (userStats, publicStats) {
			var stats = {
				count: userStats.guessMisses + userStats.guessHits,
				publicWins: publicStats.winCount,
				publicLosses: publicStats.lossCount,
				privateWins: userStats.privateGameWinCount,
				privateLosses: userStats.privateGameLossCount
			};

			if (!stats.count || !userStats.guessHits) {
				stats.guessAccuracy = 0;
			}
			else {
				stats.guessAccuracy = Math.round((userStats.guessHits / stats.count) * 100);
			}

			return stats;
		});
}

function getHangmanUserStatistics(userId) {
	return HangmanUserStatistics.findOne({user: userId}).then(function (hangmanUserStatistics) {
		if (hangmanUserStatistics) return hangmanUserStatistics;
		return HangmanUserStatistics.create({user: userId});
	});
}

function getHangmanPublicStatistics() {
	return HangmanPublicGameStatistics.findOne({}).then(function (publicStats) {
		if (publicStats) return publicStats;
		return HangmanPublicGameStatistics.create({});
	});
}

function getFightStatistics(userId) {
	return Fight.aggregate(
		[{$match: {$or: [{opponent: ObjectId(userId)}, {challenger: ObjectId(userId)}]}},
			{
				$project: {
					winningUser: '$winningUser',
					losingUser: {
						$cond: [
							{$ne: ['$winningUser', null]},
							{$cond: [{$ne: ['$winningUser', '$challenger']}, '$challenger', '$opponent']},
							null
						]
					},
					opponentUser: '$opponent',
					challengerUser: '$challenger'
				}
			}
		]).exec().then(function (fightData) {

			var fightResults = {};
			var victims = {};
			var userIds = [];
			if (fightData) {
				var userStats = {};
				userStats.wins = 0;
				userStats.losses = 0;
				userStats.ties = 0;
				userStats.totalGames = 0;

				var fightIds = [];

				_.forEach(fightData, function (fightDataElement) {

					fightIds.push(fightDataElement._id);
					if (fightDataElement.winningUser) {
						if (fightDataElement.winningUser == userId) {
							userStats.wins++;

							if (fightDataElement.opponentUser == userId) {
								if (!victims[fightDataElement.challengerUser]) {
									victims[fightDataElement.challengerUser] = {};
									victims[fightDataElement.challengerUser].beatings = 0;
									victims[fightDataElement.challengerUser]._id = fightDataElement.challengerUser;
								}

								victims[fightDataElement.challengerUser].beatings++;
								userIds.push(fightDataElement.challengerUser);
							}
							else {
								if (!victims[fightDataElement.opponentUser]) {
									victims[fightDataElement.opponentUser] = {};
									victims[fightDataElement.opponentUser].beatings = 0;
									victims[fightDataElement.opponentUser]._id = fightDataElement.opponentUser;
								}

								victims[fightDataElement.opponentUser].beatings++;
								userIds.push(fightDataElement.opponentUser);
							}
						}
						else {
							userStats.losses++;
						}

						userStats.totalGames++;
					}
					else {
						userStats.ties++;
						userStats.totalGames++;
					}

					userStats.winPercentage = userStats.wins > 0 ?
						Math.round(((userStats.wins + (userStats.ties * 0.5)) / userStats.totalGames) * 100) : 0;
				});

				fightResults.fightWinPercentage = userStats.winPercentage + '% (' + userStats.wins + '-' + userStats.losses + '-' + userStats.ties + ')';
				fightResults.topVictims = _.take(_.sortByOrder(victims, ['beatings'], [false]), 5);

				userIds = _.uniq(userIds);

				return User.find({"_id": {$in: userIds}}).then(function (users) {

					_.forEach(fightResults.topVictims, function (victim) {
						var userIndex = _.findIndex(users, function (user) {
							return user._id == victim._id;
						});

						victim.userNick = users[userIndex].nick;
					});

					return FightRound.find({fight: {$in: fightIds}}).then(function (fightRounds) {
						var fightRoundStats = {};
						fightRoundStats.wins = 0;
						fightRoundStats.losses = 0;
						fightRoundStats.ties = 0;
						fightRoundStats.totalRounds = 0;

						_.forEach(fightRounds, function (fightRound) {
							if (fightRound.winningUser) {
								if (fightRound.winningUser == userId) {
									fightRoundStats.wins++;
								}
								else {
									fightRoundStats.losses++;
								}
							}
							else {
								fightRoundStats.ties++;
							}

							fightRoundStats.totalRounds++;

							fightRoundStats.winPercentage = fightRoundStats.wins > 0 ?
								Math.round(((fightRoundStats.wins + (fightRoundStats.ties * 0.5)) / fightRoundStats.totalRounds) * 100) : 0;
						});

						fightResults.fightRoundWinPercentage = fightRoundStats.winPercentage + '% (' + fightRoundStats.wins + '-' + fightRoundStats.losses + '-' + fightRoundStats.ties + ')';

						return fightResults;
					});
				});
			}

			fightResults.fightWinPercentage = '0% (0-0-0)';
			fightResults.victims = null;
			fightResults.fightRoundWinPercentage = '0% (0-0-0)';

			return fightResults;
		});
}

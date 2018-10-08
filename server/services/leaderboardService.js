var Promise = require("bluebird");
var moment = require("moment");
var fs = Promise.promisifyAll(require("fs"));
var path = require("path");
var ent = require("ent");
var ObjectId = require("mongodb").ObjectID;

var User = require("../models/User");
var Fight = require("../models/Fight");
var FightRound = require("../models/FightRound");
var HangmanUserStatistics = require("../models/HangmanUserStatistics");

module.exports.getLeaderboard = function() {
	return generateLeaderboard();
};

module.exports.getLoserboard = function() {
	return generateLoserboard();
};

function generateLoserboard() {
	var sort = 1;

	return Promise.join(
		fs.readFileAsync(path.join(__dirname, "./templates/loserboardTemplate.ejs")),
		getFightAggregateData(sort),
		getFightRoundAggregateData(sort),
		getHangmanPrivateGameData(sort),
		getHangmanAccuracyData(sort)
	).spread(function(template, fightData, fightRoundData, hangmanPrivateGameData, hangmanGuessAccuracyData) {
		return generateResults(template, fightData, fightRoundData, hangmanPrivateGameData, hangmanGuessAccuracyData);
	});
}

function generateLeaderboard() {
	var sort = -1;

	return Promise.join(
		fs.readFileAsync(path.join(__dirname, "./templates/leaderboardTemplate.ejs")),
		getFightAggregateData(sort),
		getFightRoundAggregateData(sort),
		getHangmanPrivateGameData(sort),
		getHangmanAccuracyData(sort)
	).spread(function(template, fightData, fightRoundData, hangmanPrivateGameData, hangmanGuessAccuracyData) {
		return generateResults(template, fightData, fightRoundData, hangmanPrivateGameData, hangmanGuessAccuracyData);
	});
}

function generateResults(template, fightData, fightRoundData, hangmanPrivateGameData, hangmanGuessAccuracyData) {
	// get all our users so that we can get our nicks to display
	var userIds = [];

	_.forEach(fightData, function(fightDataElement) {
		userIds.push(fightDataElement._id);
	});

	_.forEach(fightRoundData, function(fightRoundDataElement) {
		userIds.push(fightRoundDataElement._id);
	});

	_.forEach(hangmanPrivateGameData, function(hangmanPrivateGameDataElement) {
		userIds.push(hangmanPrivateGameDataElement.userId);
	});

	_.forEach(hangmanGuessAccuracyData, function(hangmanGuessAccuracyDataElement) {
		userIds.push(hangmanGuessAccuracyDataElement.userId);
	});

	userIds = _.uniq(userIds);

	return User.find({ _id: { $in: userIds } }).then(function(users) {
		var data;

		console.log(users, fightData);

		if (users) {
			// add user nick to the data we have retrieved
			_.forEach(fightData, function(fightDataElement) {
				var userIndex = _.findIndex(users, function(user) {
					return user._id == fightDataElement._id;
				});

				fightDataElement.userNick = users[userIndex].nick;
			});

			_.forEach(fightRoundData, function(fightRoundDataElement) {
				var userIndex = _.findIndex(users, function(user) {
					return user._id == fightRoundDataElement._id;
				});

				fightRoundDataElement.userNick = users[userIndex].nick;
			});

			_.forEach(hangmanPrivateGameData, function(hangmanPrivateGameDataElement) {
				var userIndex = _.findIndex(users, function(user) {
					return user._id == hangmanPrivateGameDataElement.userId;
				});

				hangmanPrivateGameDataElement.userNick = users[userIndex].nick;
			});

			_.forEach(hangmanGuessAccuracyData, function(hangmanGuessAccuracyDataElement) {
				var userIndex = _.findIndex(users, function(user) {
					return user._id == hangmanGuessAccuracyDataElement.userId;
				});

				hangmanGuessAccuracyDataElement.userNick = users[userIndex].nick;
			});

			data = {
				fightRank1: fightData[0]
					? fightData[0].userNick +
					  " " +
					  fightData[0].winPercentage +
					  "% (" +
					  fightData[0].wins +
					  "-" +
					  fightData[0].losses +
					  "-" +
					  fightData[0].ties +
					  ")"
					: "N/A",
				fightRank2: fightData[1]
					? fightData[1].userNick +
					  " " +
					  fightData[1].winPercentage +
					  "% (" +
					  fightData[1].wins +
					  "-" +
					  fightData[1].losses +
					  "-" +
					  fightData[1].ties +
					  ")"
					: "N/A",
				fightRank3: fightData[2]
					? fightData[2].userNick +
					  " " +
					  fightData[2].winPercentage +
					  "% (" +
					  fightData[2].wins +
					  "-" +
					  fightData[2].losses +
					  "-" +
					  fightData[2].ties +
					  ")"
					: "N/A",
				fightRank4: fightData[3]
					? fightData[3].userNick +
					  " " +
					  fightData[3].winPercentage +
					  "% (" +
					  fightData[3].wins +
					  "-" +
					  fightData[3].losses +
					  "-" +
					  fightData[3].ties +
					  ")"
					: "N/A",
				fightRank5: fightData[4]
					? fightData[4].userNick +
					  " " +
					  fightData[4].winPercentage +
					  "% (" +
					  fightData[4].wins +
					  "-" +
					  fightData[4].losses +
					  "-" +
					  fightData[4].ties +
					  ")"
					: "N/A",
				fightRank6: fightData[5]
					? fightData[5].userNick +
					  " " +
					  fightData[5].winPercentage +
					  "% (" +
					  fightData[5].wins +
					  "-" +
					  fightData[5].losses +
					  "-" +
					  fightData[5].ties +
					  ")"
					: "N/A",
				fightRank7: fightData[6]
					? fightData[6].userNick +
					  " " +
					  fightData[6].winPercentage +
					  "% (" +
					  fightData[6].wins +
					  "-" +
					  fightData[6].losses +
					  "-" +
					  fightData[6].ties +
					  ")"
					: "N/A",
				fightRank8: fightData[7]
					? fightData[7].userNick +
					  " " +
					  fightData[7].winPercentage +
					  "% (" +
					  fightData[7].wins +
					  "-" +
					  fightData[7].losses +
					  "-" +
					  fightData[7].ties +
					  ")"
					: "N/A",
				fightRank9: fightData[8]
					? fightData[8].userNick +
					  " " +
					  fightData[8].winPercentage +
					  "% (" +
					  fightData[8].wins +
					  "-" +
					  fightData[8].losses +
					  "-" +
					  fightData[8].ties +
					  ")"
					: "N/A",
				fightRank10: fightData[9]
					? fightData[9].userNick +
					  " " +
					  fightData[9].winPercentage +
					  "% (" +
					  fightData[9].wins +
					  "-" +
					  fightData[9].losses +
					  "-" +
					  fightData[9].ties +
					  ")"
					: "N/A",
				fightRounds1: fightRoundData[0] ? fightRoundData[0].userNick + " " + fightRoundData[0].totalWins : "N/A",
				fightRounds2: fightRoundData[1] ? fightRoundData[1].userNick + " " + fightRoundData[1].totalWins : "N/A",
				fightRounds3: fightRoundData[2] ? fightRoundData[2].userNick + " " + fightRoundData[2].totalWins : "N/A",
				fightRounds4: fightRoundData[3] ? fightRoundData[3].userNick + " " + fightRoundData[3].totalWins : "N/A",
				fightRounds5: fightRoundData[4] ? fightRoundData[4].userNick + " " + fightRoundData[4].totalWins : "N/A",
				hangmanGuessAccuracy1: hangmanGuessAccuracyData[0]
					? hangmanGuessAccuracyData[0].userNick +
					  " " +
					  Math.round(hangmanGuessAccuracyData[0].guessAccuracy * 100) +
					  "%"
					: "N/A",
				hangmanGuessAccuracy2: hangmanGuessAccuracyData[1]
					? hangmanGuessAccuracyData[1].userNick +
					  " " +
					  Math.round(hangmanGuessAccuracyData[1].guessAccuracy * 100) +
					  "%"
					: "N/A",
				hangmanGuessAccuracy3: hangmanGuessAccuracyData[2]
					? hangmanGuessAccuracyData[2].userNick +
					  " " +
					  Math.round(hangmanGuessAccuracyData[2].guessAccuracy * 100) +
					  "%"
					: "N/A",
				hangmanGuessAccuracy4: hangmanGuessAccuracyData[3]
					? hangmanGuessAccuracyData[3].userNick +
					  " " +
					  Math.round(hangmanGuessAccuracyData[3].guessAccuracy * 100) +
					  "%"
					: "N/A",
				hangmanGuessAccuracy5: hangmanGuessAccuracyData[4]
					? hangmanGuessAccuracyData[4].userNick +
					  " " +
					  Math.round(hangmanGuessAccuracyData[4].guessAccuracy * 100) +
					  "%"
					: "N/A",
				hangmanPrivateGames1: hangmanPrivateGameData[0]
					? hangmanPrivateGameData[0].userNick + " " + Math.round(hangmanPrivateGameData[0].winPercentage * 100) + "%"
					: "N/A",
				hangmanPrivateGames2: hangmanPrivateGameData[1]
					? hangmanPrivateGameData[1].userNick + " " + Math.round(hangmanPrivateGameData[1].winPercentage * 100) + "%"
					: "N/A",
				hangmanPrivateGames3: hangmanPrivateGameData[2]
					? hangmanPrivateGameData[2].userNick + " " + Math.round(hangmanPrivateGameData[2].winPercentage * 100) + "%"
					: "N/A",
				hangmanPrivateGames4: hangmanPrivateGameData[3]
					? hangmanPrivateGameData[3].userNick + " " + Math.round(hangmanPrivateGameData[3].winPercentage * 100) + "%"
					: "N/A",
				hangmanPrivateGames5: hangmanPrivateGameData[4]
					? hangmanPrivateGameData[4].userNick + " " + Math.round(hangmanPrivateGameData[4].winPercentage * 100) + "%"
					: "N/A"
			};
		} else {
			data = {
				fightRank1: "N/A",
				fightRank2: "N/A",
				fightRank3: "N/A",
				fightRank4: "N/A",
				fightRank5: "N/A",
				fightRounds1: "N/A",
				fightRounds2: "N/A",
				fightRounds3: "N/A",
				fightRounds4: "N/A",
				fightRounds5: "N/A",
				hangmanGuessAccuracy1: "N/A",
				hangmanGuessAccuracy2: "N/A",
				hangmanGuessAccuracy3: "N/A",
				hangmanGuessAccuracy4: "N/A",
				hangmanGuessAccuracy5: "N/A",
				hangmanPrivateGames1: "N/A",
				hangmanPrivateGames2: "N/A",
				hangmanPrivateGames3: "N/A",
				hangmanPrivateGames4: "N/A",
				hangmanPrivateGames5: "N/A"
			};
		}

		return ent.encode(_.template(template)(data));
	}); // end find Users
}

function getFightAggregateData(sort) {
	return new Promise(function(resolve, reject) {
		Fight.aggregate(
			[
				{
					$project: {
						winningUser: "$winningUser",
						losingUser: {
							$cond: [
								{ $ne: ["$winningUser", null] },
								{ $cond: [{ $ne: ["$winningUser", "$challenger"] }, "$challenger", "$opponent"] },
								null
							]
						},
						opponentUser: "$opponent",
						challengerUser: "$challenger"
					}
				}
			],
			function(err, fightData) {
				if (err) return reject(err);
				resolve(fightData);
			}
		);
	}).then(function(fightData) {
		if (fightData) {
			var userStats = {};

			_.forEach(fightData, function(fightDataElement) {
				if (!userStats[fightDataElement.opponentUser]) {
					userStats[fightDataElement.opponentUser] = {};
					userStats[fightDataElement.opponentUser].wins = 0;
					userStats[fightDataElement.opponentUser].losses = 0;
					userStats[fightDataElement.opponentUser].ties = 0;
					userStats[fightDataElement.opponentUser].totalGames = 0;
					userStats[fightDataElement.opponentUser]._id = fightDataElement.opponentUser;
				}

				if (!userStats[fightDataElement.challengerUser]) {
					userStats[fightDataElement.challengerUser] = {};
					userStats[fightDataElement.challengerUser].wins = 0;
					userStats[fightDataElement.challengerUser].losses = 0;
					userStats[fightDataElement.challengerUser].ties = 0;
					userStats[fightDataElement.challengerUser].totalGames = 0;
					userStats[fightDataElement.challengerUser]._id = fightDataElement.challengerUser;
				}

				if (fightDataElement.winningUser) {
					userStats[fightDataElement.winningUser].wins++;
					userStats[fightDataElement.winningUser].totalGames++;

					userStats[fightDataElement.losingUser].losses++;
					userStats[fightDataElement.losingUser].totalGames++;
				} else {
					userStats[fightDataElement.opponentUser].ties++;
					userStats[fightDataElement.opponentUser].totalGames++;

					userStats[fightDataElement.challengerUser].ties++;
					userStats[fightDataElement.challengerUser].totalGames++;
				}

				userStats[fightDataElement.opponentUser].winPercentage =
					userStats[fightDataElement.opponentUser].wins > 0
						? Math.round(
								((userStats[fightDataElement.opponentUser].wins + userStats[fightDataElement.opponentUser].ties * 0.5) /
									userStats[fightDataElement.opponentUser].totalGames) *
									100
						  )
						: 0;
				userStats[fightDataElement.challengerUser].winPercentage =
					userStats[fightDataElement.challengerUser].wins > 0
						? Math.round(
								((userStats[fightDataElement.challengerUser].wins +
									userStats[fightDataElement.challengerUser].ties * 0.5) /
									userStats[fightDataElement.challengerUser].totalGames) *
									100
						  )
						: 0;
			});

			var sortString = sort != -1;

			var usersWithMoreThan10Games = _.filter(userStats, function(user) {
				return user.totalGames >= 10;
			});

			return _.take(_.sortByOrder(usersWithMoreThan10Games, ["winPercentage"], [sortString]), 10);
		}

		return null;
	});
}

function getFightRoundAggregateData(sort) {
	return new Promise(function(resolve, reject) {
		FightRound.aggregate(
			[
				{ $match: { winningUser: { $ne: null } } },
				{ $group: { _id: "$winningUser", totalWins: { $sum: 1 } } },
				{ $sort: { totalWins: sort } },
				{ $limit: 5 }
			],
			function(err, fightRoundData) {
				if (err) return reject(err);
				resolve(fightRoundData);
			}
		);
	});
}

function getHangmanPrivateGameData(sort) {
	return new Promise(function(resolve, reject) {
		HangmanUserStatistics.aggregate(
			[
				{
					$match: {
						$or: [{ privateGameWinCount: { $gt: 0 } }, { privateGameLossCount: { $gt: 0 } }]
					}
				},
				{
					$project: {
						userId: "$user",
						winPercentage: {
							$cond: [
								{ $gt: ["$privateGameWinCount", 0] },
								{
									$divide: [
										"$privateGameWinCount",
										{
											$add: ["$privateGameWinCount", "$privateGameLossCount"]
										}
									]
								},
								0
							]
						}
					}
				},
				{ $sort: { winPercentage: sort } },
				{ $limit: 5 }
			],
			function(err, hangmanPrivateGameData) {
				if (err) return reject(err);
				resolve(hangmanPrivateGameData);
			}
		);
	});
}

function getHangmanAccuracyData(sort) {
	return new Promise(function(resolve, reject) {
		HangmanUserStatistics.aggregate(
			[
				{
					$match: {
						$or: [{ guessHits: { $gt: 0 } }, { guessMisses: { $gt: 0 } }]
					}
				},
				{
					$project: {
						userId: "$user",
						guessAccuracy: {
							$cond: [
								{ $gt: ["$guessHits", 0] },
								{
									$divide: ["$guessHits", { $add: ["$guessMisses", "$guessHits"] }]
								},
								0
							]
						}
					}
				},
				{ $sort: { guessAccuracy: sort } },
				{ $limit: 5 }
			],
			function(err, hangmanAccuracyData) {
				if (err) return reject(err);
				resolve(hangmanAccuracyData);
			}
		);
	});
}

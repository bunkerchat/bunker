var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ent = require('ent');
var InvalidInputError = require('../errors/InvalidInputError');

/*
 Some key notes about the current design decisions for Fight:
 - A fight will take place between 2 users in a single room.
 - Even though it is asynchronous, it is currently required that both members be part of the room that the challenger is originating the fight in.
 - Currently fights, even completed ones, are retained in the Mongo DB.
 - This is intentional for expanding on statistics later, so all history of fights will be available.
 */

module.exports.play = function (roomMember, command) {

	// check if we are asking for the list of open fights
	var listParam = /^\/f(?:ight)?(?:(\s\-list)?|$)/.exec(command);
	if (listParam && listParam[1]) {
		return getOpenFightList(roomMember);
	}

	// need to parse out the command info so we know what to do
	var parameters = /^\/f(?:ight)?(?:\s+([\w\s\.]{0,19})\s+(h|m|l)\s+(h|m|l)\s+(h|m|l).*$)/.exec(command);
	if (!parameters || parameters.length != 5) {
		throw new InvalidInputError('Cannot start the fight — Bad input, see the help topic on fight (/help fight) for correct parameter usage');
	}

	var opponentNick = parameters[1];
	var round1Play = parameters[2];
	var round2Play = parameters[3];
	var round3Play = parameters[4];

	return RoomMember.find({room: roomMember.room}).populate('user').then(function (roomMembers) {

		var opponentRoomMember = _.find(roomMembers, function (roomMember) {
			return roomMember.user.nick.toLowerCase() === opponentNick.toLowerCase();
		});

		if (!opponentRoomMember) {
			throw new InvalidInputError('Cannot start the fight — ' + opponentNick + ' is not a member of this room');
		}
		if (roomMember.user.id == opponentRoomMember.user.id) {
			throw new InvalidInputError('Cannot start the fight — cannot challenge yourself');
		}

		return getFight(roomMember.user.id, opponentRoomMember.user.id, roomMember.room).then(function (fight) {
			if (!fight) {
				throw new InvalidInputError('Cannot start the fight — unable to challenge ' + opponentNick + ', there is already an active fight');
			}

			return FightRound.find({fight: fight.id}).then(function (rounds) {
				if (!rounds || rounds.length == 0) {
					// this is a new challenge

					// async execution of the round creation
					return Promise.join(
						FightRound.create({
							fight: fight.id,
							challengerPlay: round1Play,
							roundNumber: 1
						}),
						FightRound.create({
							fight: fight.id,
							challengerPlay: round2Play,
							roundNumber: 2
						}),
						FightRound.create({
							fight: fight.id,
							challengerPlay: round3Play,
							roundNumber: 3
						})
					)
						.spread(function (round1, round2, round3) {
							return buildChallengeResponse(fight);
						});
				}
				else {
					// we are responding to a challenge
					var round1Index = _.findIndex(rounds, function (round) {
						return round.roundNumber == 1;
					});
					var round2Index = _.findIndex(rounds, function (round) {
						return round.roundNumber == 2;
					});
					var round3Index = _.findIndex(rounds, function (round) {
						return round.roundNumber == 3;
					});

					rounds[round1Index].opponentPlay = round1Play;
					rounds[round2Index].opponentPlay = round2Play;
					rounds[round3Index].opponentPlay = round3Play;

					var round1Update = rounds[round1Index].save();
					var round2Update = rounds[round2Index].save();
					var round3Update = rounds[round3Index].save();

					//fight.opponentsRoom = roomMember.room;

					return Promise.join(
						round1Update,
						round2Update,
						round3Update,
						fight.save()
					)
						.spread(function (round1, round2, round3, updatedFight) {
							return buildFightResultsResponse(updatedFight, round1, round2, round3);
						});
				}
			});
		});
	});
};

function getOpenFightList(roomMember) {
	return Promise.join(
		Fight.find({winningUser: null, resultMessage: '', challenger: roomMember.user.id, room: roomMember.room}),
		Fight.find({winningUser: null, resultMessage: '', opponent: roomMember.user.id, room: roomMember.room})
	)
		.spread(function (myChallenges, mySlacking) {

			if ((myChallenges && myChallenges.length > 0) || ( mySlacking && mySlacking.length > 0)) {
				var userIds = [];

				_.forEach(myChallenges, function (challenge) {
					userIds.push(challenge.opponent);
				});

				_.forEach(mySlacking, function (myUnresponded) {
					userIds.push(myUnresponded.challenger);
				});

				userIds = _.unique(userIds);

				return User.find({'id': {$in: userIds}}).then(function (users) {
					// build our response message.
					var message = [];
					var slackers = [];
					var myUnresponded = [];

					_.forEach(myChallenges, function (challenge) {
						var userIndex = _.findIndex(users, function (user) {
							return user.id == challenge.opponent;
						});

						slackers.push(users[userIndex].nick);
					});

					slackers = _.unique(slackers);

					if (slackers && slackers.length > 0) {
						message.push('Unresponded to challenges from me:  ' + slackers.join(', '))
					}
					else {
						message.push('No unresponded to challenges from me.');
					}

					_.forEach(mySlacking, function (unrespondedTo) {
						var userIndex = _.findIndex(users, function (user) {
							return user.id == unrespondedTo.challenger;
						});

						myUnresponded.push(users[userIndex].nick);
					});

					myUnresponded = _.unique(myUnresponded);

					if (myUnresponded && myUnresponded.length > 0) {
						message.push('Unresponded to challenges to me:  ' + myUnresponded.join(', '));
					}
					else {
						message.push('No unresponded to challenges to me.');
					}

					return {message: ent.encode(message.join('\n')), isList: true};
				});
			}

			return {message: 'No outstanding unresponded to challenges to or from you.', isList: true};
		});
}

function getFight(userId, opponentUserId, roomId) {
	// look for both permutations where we are the challenger or the opponent responding to the challenge
	// if no fight is found between the 2 users, create one and send it as a new challenge
	return Fight.findOne({
		challenger: userId,
		opponent: opponentUserId,
		room: roomId,
		resultMessage: ''
	}).then(function (fight) {
		if (fight) {
			// we can't have more than one active fight between the same users in a room.
			return null;
		}
		else {
			return Fight.findOne({
				challenger: opponentUserId,
				opponent: userId,
				room: roomId,
				resultMessage: ''
			}).then(function (fight) {
				if (fight) {
					return fight;
				}
				else {
					return Fight.create({challenger: userId, room: roomId, opponent: opponentUserId});
				}
			});
		}
	});
}

function buildChallengeResponse(fight) {
	return Promise.join(
		User.findOne({id: fight.challenger}),
		User.findOne({id: fight.opponent})
	)
		.spread(function (challenger, opponent) {
			var opponentNick = opponent.nick;
			var challengerNick = challenger.nick;

			var message = [];
			message.push('@' + opponentNick + ' you have been challenged by @' + challengerNick + ' to a fight!');
			message.push('Respond to the challenge using /f ' + challengerNick + ' with your 3 rounds of fight input;');
			message.push('example = /f ' + challengerNick + ' h m l (see /help fight for more details).');

			return {message: ent.encode(message.join('\n'))};
		});
}

function buildFightResultsResponse(fight, round1, round2, round3) {
	return Promise.join(
		User.findOne({id: fight.challenger.id}),
		User.findOne({id: fight.opponent.id})
	)
		.spread(function (challenger, opponent) {
			var opponentNick = opponent.nick;
			var challengerNick = challenger.nick;

			var responseString = [];

			var round1Data = getRoundPlayData(round1, challenger, opponent);
			var round2Data = getRoundPlayData(round2, challenger, opponent);
			var round3Data = getRoundPlayData(round3, challenger, opponent);

			responseString.push('Fight between @' + challengerNick + ' and @' + opponentNick + ' has begun!');
			responseString.push(round1Data.message);
			responseString.push(round2Data.message);
			responseString.push(round3Data.message);

			var fightResultData = getFightResultData(challenger, opponent, round1, round2, round3);

			fight.winningUser = fightResultData.winner;
			round1.winningUser = round1Data.winner;
			round2.winningUser = round2Data.winner;
			round3.winningUser = round3Data.winner;

			if (fightResultData.winner) {
				if (fightResultData.winner.id == challenger.id) {
					responseString.push(challengerNick + ' wins the fight ' + fightResultData.challengerWins + ' to ' + fightResultData.opponentWins + '.  :' + getFatalityEmote() + ':');
				}
				else {
					responseString.push(opponentNick + ' wins the fight ' + fightResultData.opponentWins + ' to ' + fightResultData.challengerWins + '.  :' + getFatalityEmote() + ':');
				}
			} else {
				// was a tie
				responseString.push('The fight was a tie ' + fightResultData.challengerWins + ' to ' + fightResultData.opponentWins + '.  :' + getTieEmote() + ':');
			}

			fight.resultMessage = ent.encode(responseString.join('\n'));

			return Promise.join(
				fight.save(),
				round1.save(),
				round2.save(),
				round3.save()
			)
				.spread(function (updatedFight, updatedRound1, updatedRound2, updatedRound3) {
					return {message: updatedFight.resultMessage};
				});
		});
}

function getFightResultData(challenger, opponent, round1, round2, round3) {
	var challengerWins = 0;
	var opponentWins = 0;
	var rounds = [round1, round2, round3];

	_.forEach(rounds, function (round) {
		var winner = determineRoundWinner(round, challenger.nick, opponent.nick);
		if (winner) {
			if (winner == challenger.nick) {
				challengerWins++;
			}
			else {
				opponentWins++;
			}
		}
	});

	if (challengerWins == opponentWins) {
		return {winner: null, challengerWins: challengerWins, opponentWins: opponentWins};
	}
	else if (challengerWins > opponentWins) {
		return {winner: challenger, challengerWins: challengerWins, opponentWins: opponentWins};
	}
	else {
		return {winner: opponent, challengerWins: challengerWins, opponentWins: opponentWins};
	}
}

function getRoundPlayData(fightRound, challenger, opponent) {
	var roundPlayMessage = 'Round ' + fightRound.roundNumber + '   ';

	if (fightRound.challengerPlay == 'h') {
		roundPlayMessage += ':HighKickRight: ';
	}
	else if (fightRound.challengerPlay == 'm') {
		roundPlayMessage += ':MidKickRight: ';
	}
	else if (fightRound.challengerPlay == 'l') {
		roundPlayMessage += ':LowKickRight: ';
	}

	if (fightRound.opponentPlay == 'h') {
		roundPlayMessage += ':HighKickLeft:';
	}
	else if (fightRound.opponentPlay == 'm') {
		roundPlayMessage += ':MidKickLeft:';
	}
	else if (fightRound.opponentPlay == 'l') {
		roundPlayMessage += ':LowKickLeft:';
	}

	var winner = determineRoundWinner(fightRound, challenger, opponent);

	if (winner) {
		roundPlayMessage += '  ' + winner.nick + ' wins!';
		return {winner: winner, message: roundPlayMessage}
	}
	else {
		roundPlayMessage += '  Tie';
		return {winner: null, message: roundPlayMessage}
	}
}

function determineRoundWinner(fightRound, challenger, opponent) {

	// Assumption: no improper moves are input

	if (fightRound.challengerPlay == fightRound.opponentPlay) {
		return null; // tie
	}
	else if (fightRound.challengerPlay == 'h') {
		return fightRound.opponentPlay == 'm' ? challenger : opponent; // high beats mid
	}
	else if (fightRound.challengerPlay == 'm') {
		return fightRound.opponentPlay == 'l' ? challenger : opponent; // mid beats low
	}
	else if (fightRound.challengerPlay == 'l') {
		return fightRound.opponentPlay == 'h' ? challenger : opponent; // low beats high
	}
}

function getFatalityEmote() {
	return _.sample([
		'baraka1',
		'baraka2',
		'cage2',
		'jax1',
		'jax2',
		'kitana1',
		'kitana2',
		'kunglao1',
		'kunglao2',
		'liukang1',
		'liukang2',
		'mileena1',
		'mileena2',
		'rayden1',
		'rayden2',
		'reptile1',
		'reptile2',
		'scorpion1',
		'scorpion2',
		'shangtsung1',
		'shangtsung2',
		'shangtsung3',
		'subzero1',
		'subzero2'
	]);
}

function getTieEmote() {
	return _.sample([
		'tie0',
		'tie1',
		'tie2'
	]);
}

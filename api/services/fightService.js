var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ent = require('ent');

/*
 Some key notes about the current design decisions for Fight:
 - A fight will take place between 2 users in a single room.
 - Even though it is asynchronous, it is currently required that both members be part of the room that the challenger is originating the fight in.
 - A fight will be hangled via private messages to the users involved, it will not be publicly shown.
 - Currently fights, even completed ones, are retained in the Mongo DB.
 - This is intentional for expanding on stasitics later, so all history of fights will be avialable.
 */

module.exports.play = function (roomMember, command) {
	// need to parse out the command info so we know what to do
	var round1Play, round2Play, round3Play, roundPlayIndex, parameters;

	parameters = command.split(/\s/);

	// since user nick name can have spaces, need to handle a little special
	var opponentNickParameterIndex = _.findIndex(parameters, function (param) {
		return param == '-vs';
	});
	roundPlayIndex = _.findIndex(parameters, function (param) {
		return param == '-r';
	});

	var index = opponentNickParameterIndex + 1;
	var opponentNick = '';

	while (index < roundPlayIndex) {
		opponentNick += parameters[index] + ' ';
		index++;
	}

	opponentNick = opponentNick.trim();

	round1Play = parameters[roundPlayIndex + 1];
	round2Play = parameters[roundPlayIndex + 2];
	round3Play = parameters[roundPlayIndex + 3];

	if (opponentNickParameterIndex <= 0 || roundPlayIndex <= 0 || !isValidPlay(round1Play) || !isValidPlay(round2Play) || !isValidPlay(round3Play)) {
		return Promise.resolve({error: 'Cannot start the fight.  Bad input, see the help topic on fight (/help fight) for correct parameter usage.'});
	}

	return RoomMember.find({room: roomMember.room}).populate('user').then(function (roomMembers) {

		var opponentRoomMember = _.find(roomMembers, function (roomMember) {
			return roomMember.user.nick.toLowerCase() === opponentNick.toLowerCase();
		});

		if (!opponentRoomMember) {
			// we got a bad user nickname
			return Promise.resolve({error: 'Cannot start the fight.  Unable to find a user with the nickname of ' + opponentNick + '.'});
		}

		return getFight(roomMember.user.id, opponentRoomMember.user.id, roomMember.room).then(function (fight) {
			if (!fight) {
				return Promise.resolve({error: 'Cannot start the fight.  Unable to challenge the user ' + opponentNick + ' in this room, there is already an active fight.'});
			}

			return FightRound.find({fight: fight.id}).then(function (rounds) {
				if (!rounds || rounds.length == 0) {
					// this is a new challenge

					// async execution of the round creation
					return Promise.join(
						FightRound.create({
							fight: fight.id,
							challengerPlay: round1Play.toLowerCase(),
							roundNumber: 1
						}),
						FightRound.create({
							fight: fight.id,
							challengerPlay: round2Play.toLowerCase(),
							roundNumber: 2
						}),
						FightRound.create({
							fight: fight.id,
							challengerPlay: round3Play.toLowerCase(),
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

					rounds[round1Index].opponentPlay = round1Play.toLowerCase();
					rounds[round2Index].opponentPlay = round2Play.toLowerCase();
					rounds[round3Index].opponentPlay = round3Play.toLowerCase();

					var round1Update = rounds[round1Index].save();
					var round2Update = rounds[round2Index].save();
					var round3Update = rounds[round3Index].save();

					fight.opponentsRoom = roomMember.room;

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

			var opponentMessage = [];
			opponentMessage.push('@' + opponentNick + ' you have been challenged by ' + challengerNick + ' to a fight!');
			opponentMessage.push('Respond to the challenge using /f -vs ' + challengerNick + ' with your 3 rounds of fight input [ -r [h,m,l] [h,m,l] [h,m,l]; example -r h m l ].');
			opponentMessage.push('High kick (h) beats Mid kick (m), Mid kick (m) beats Low kick (l), Low kick (l) beats High kick (h).');

			var challengerMessage = 'Your challenge to ' + opponentNick + ' has been sent.  When they respond to the challenge the fight will begin.';

			return {
				messageForChallenger: ent.encode(challengerMessage),
				messageForOpponent: ent.encode(opponentMessage.join('\n')),
				challengerId: challenger.id,
				opponentId: opponent.id,
				isChallengeMessage: true
			};
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
			responseString.push('Fight between ' + challengerNick + ' and ' + opponentNick + ' has begun!');
			responseString.push(getRoundPlayResponse(round1, challengerNick, opponentNick));
			responseString.push(getRoundPlayResponse(round2, challengerNick, opponentNick));
			responseString.push(getRoundPlayResponse(round3, challengerNick, opponentNick));
			responseString.push(getFightResultResponse(fight, challengerNick, opponentNick, round1, round2, round3));

			fight.resultMessage = ent.encode(responseString.join('\n'));

			return fight.save().then(function (updatedFight) {
				return {
					message: updatedFight.resultMessage,
					challengerId: challenger.id,
					opponentId: opponent.id,
					isChallengeMessage: false
				};
			});
		});
}

function getFightResultResponse(fight, challengerNick, opponentNick, round1, round2, round3) {
	var challengerWins = 0;
	var opponentWins = 0;
	var rounds = [round1, round2, round3];

	_.forEach(rounds, function (round) {
		var winner = determineRoundWinner(round, challengerNick, opponentNick);
		if (winner) {
			if (winner == challengerNick) {
				challengerWins++;
			}
			else {
				opponentWins++;
			}
		}
	});

	if (challengerWins == opponentWins) {
		return 'The fight was a tie ' + challengerWins + ' to ' + opponentWins + '.';
	}
	else if (challengerWins > opponentWins) {
		return challengerNick + ' wins the fight ' + challengerWins + ' to ' + opponentWins + '.';
	}
	else {
		return opponentNick + ' wins the fight ' + opponentWins + ' to ' + challengerWins + '.';
	}
}

function getRoundPlayResponse(fightRound, challengerNick, opponentNick) {
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

	var winner = determineRoundWinner(fightRound, challengerNick, opponentNick);

	if (winner) {
		roundPlayMessage += '  ' + winner + ' wins!';
	}
	else {
		roundPlayMessage += '  Tie';
	}

	return roundPlayMessage;
}

function determineRoundWinner(fightRound, challengerNick, opponentNick) {
	if (fightRound.challengerPlay == 'h') {
		if (fightRound.opponentPlay == 'h') {
			return null;
		}
		if (fightRound.opponentPlay == 'm') {
			return challengerNick;
		}
		if (fightRound.opponentPlay == 'l') {
			return opponentNick;
		}
	}

	if (fightRound.challengerPlay == 'm') {
		if (fightRound.opponentPlay == 'h') {
			return opponentNick;
		}
		if (fightRound.opponentPlay == 'm') {
			return null;
		}
		if (fightRound.opponentPlay == 'l') {
			return challengerNick;
		}
	}

	if (fightRound.challengerPlay == 'l') {
		if (fightRound.opponentPlay == 'h') {
			return challengerNick;
		}
		if (fightRound.opponentPlay == 'm') {
			return opponentNick;
		}
		if (fightRound.opponentPlay == 'l') {
			return null;
		}
	}
}

function isValidPlay(roundPlay) {
	if (!roundPlay) {
		return false;
	}

	switch (roundPlay.toLowerCase()) {
		case 'h':
		case 'm':
		case 'l':
			return true;
		default:
			return false;
	}
}

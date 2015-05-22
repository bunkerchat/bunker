var sevenLetterWords = require('./hangmanWords');

module.exports.play = function (roomMember, command) {

	return HangmanGame.findOne({room: roomMember.room}).then(function (currentGame) {

		// parse the command and figure out what we are doing in the context of hangman
		var commandParts = command.split(' ');

		if (commandParts.length > 1) {
			var commandName = commandParts[1].toLowerCase();
			switch (commandName) {
				case 'start':
					return start(roomMember, commandParts.length == 3 ? commandParts[2] : null);
				case 'quit':
					return quit(roomMember);
				case 'guess':
					if (currentGame && commandParts.length == 3) {
						return guess(roomMember, currentGame, commandParts[2]);
					}
					else {
						return 'Cannot guess, there is not an active hangman game going';
					}
			}
		}

		return 'Bad hangman command, use /help hangman for help with this feature';
	});
};

function quit(roomMember) {
	return HangmanGame.destroy({room: roomMember.room}).then(function () {
		return 'This room\'s hangman instance has been removed';
	});
}

function guess(roomMember, game, guessString) {

	if (guessString.length == 1) {
		guessString = guessString.toUpperCase();
		var guessSuccess;

		if (game.word.indexOf(guessString) > -1) {
			guessSuccess = true;
			if (game.hits) {
				if (game.hits.indexOf(guessString) == -1) {
					game.hits += ',' + guessString;
				}
			}
			else {
				game.hits = guessString;
			}
		}
		else {
			guessSuccess = false;
			if (game.misses) {
				if (game.misses.indexOf(guessString) == -1) {
					game.misses += ', ' + guessString;
				}
			}
			else {
				game.misses = guessString;
			}
		}

		return HangmanGame.update({room: roomMember.room}, {
			hits: game.hits,
			misses: game.misses,
			lastGuessSuccess: guessSuccess
		}).then(function (updatedGame) {
			return buildResponse(roomMember, updatedGame[0]);
		})
	}

	return 'You are only allowed to guess a single letter at a time';
}

function start(roomMember, minScrabbleScore) {

	minScrabbleScore = minScrabbleScore || 0;
	var word = _(sevenLetterWords)
		.filter(function (word) {
			return word.scrabble >= minScrabbleScore;
		})
		.sample()
		.word;

	return quit(roomMember.room).then(function () {
		return HangmanGame.create({
			room: roomMember.room,
			word: word
		}).then(function (game) {
			return buildResponse(roomMember, game);
		});
	});
}

function buildResponse(roomMember, game) {
	var responseString = [];
	var maskedWord = buildWordMask(game.hits, game.word);

	if (!_.contains(maskedWord, '﹏')) {
		quit(roomMember);
		responseString.push(roomMember.user.nick + ' guessed the final letter!  The word was ' + game.word);
	}
	else {

		var hits = game.hits ? game.hits.split(',') : [];
		var misses = game.misses ? game.misses.split(',') : [];

		responseString.push(':hangman');
		responseString.push(misses.length);
		responseString.push(': ');

		if (misses.length >= 6) {
			responseString.push('You lose! The word was ' + game.word);
			quit(roomMember);
		}
		else {
			responseString.push('Word: ' + maskedWord);
			if (misses.length > 0) {
				responseString.push(',  Misses: ' + misses.join(', '));
			}
		}

		if (hits.length || misses.length) {
			// The last guess is the last hit if the guess was successful or the last miss if not
			var lastGuess = _.last(game.lastGuessSuccess ? hits : misses);
			responseString.push(' (' + roomMember.user.nick + ' guessed ' + lastGuess + ')');
		}
	}

	return responseString.join('');
}

function buildWordMask(hits, word) {
	if (hits) {
		var mask = '';
		for (var i = 0; i < word.length; i++) {
			var letter = word.substring(i, i + 1);
			if (hits.indexOf(letter) == -1) {
				mask += '﹏ ';
			}
			else {
				mask += letter + ' ';
			}
		}

		return mask.trim();
	}
	else {
		return '﹏  ﹏  ﹏  ﹏  ﹏  ﹏  ﹏';
	}
}


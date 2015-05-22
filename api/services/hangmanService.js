var sevenLetterWords = require('./hangmanWords');

module.exports = {
	play: function (roomId, command) {
		// parse the command and figure out what we are doing in the
		// context of hangman
		return HangmanGame.findOne({room: roomId}).then(function (currentGame) {

			var commandParts = command.split(' ');
			if (commandParts.length > 1) {
				var commandName = commandParts[1].toLowerCase();
				switch (commandName) {
					case 'start':
						return start(roomId, commandParts.length == 3 ? commandParts[2]: null);
					case 'quit':
						return quit(roomId);
					case 'guess':
						if (currentGame) {
							if (commandParts.length == 3) {
								return guess(currentGame, commandParts[2], roomId);
							}
						} else {
							return 'Cannot guess, there is not an active hangman game going';
						}
				}
			}

			return 'Bad hangman command, use /help hangman for help with this feature';
		});
	}
};

function quit(roomId) {
	return HangmanGame.destroy({room: roomId}).then(function () {
		return 'This room\'s hangman instance has been removed';
	});
}

function guess(currentGame, guessString, roomId) {

	if (guessString.length == 1) {
		guessString = guessString.toUpperCase();

		if (currentGame.word.indexOf(guessString) > -1) {
			if (currentGame.hits) {
				if (currentGame.hits.indexOf(guessString) == -1) {
					currentGame.hits += ',' + guessString;
				}
			}
			else {
				currentGame.hits = guessString;
			}
		}
		else {
			if (currentGame.misses) {
				if (currentGame.misses.indexOf(guessString) == -1) {
					currentGame.misses += ', ' + guessString;
				}
			}
			else {
				currentGame.misses = guessString;
			}
		}

		return HangmanGame.update({room: roomId}, {
			hits: currentGame.hits,
			misses: currentGame.misses
		}).then(function () {
			return buildResponse(currentGame);
		})
	}

	return 'You are only allowed to guess a single letter at a time';
}

function start(roomId, minScrabbleScore) {

	minScrabbleScore = minScrabbleScore || 0;
	var word = _(sevenLetterWords)
		.filter(function (word) {
			return word.scrabble >= minScrabbleScore;
		})
		.sample()
		.value();

	return quit(roomId).then(function () {
		return HangmanGame.create({
			room: roomId,
			word: word
		}).then(function (newGame) {
			return buildResponse(newGame);
		});
	});
}

function buildResponse(currentGame) {
	var responseString = [];
	var maskedWord = buildWordMask(currentGame.hits, currentGame.word);

	if (!_.contains(maskedWord, '﹏')) {
		quit(currentGame.room);
		responseString.push('You win!  The word was ' + currentGame.word);
	}
	else {
		responseString.push(':hangman');
		responseString.push(currentGame.misses ? currentGame.misses.split(',').length : 0);
		responseString.push(': ');
		responseString.push('Word: ' + maskedWord);
		if (currentGame.misses) {
			responseString.push(',  Misses: ' + currentGame.misses);
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


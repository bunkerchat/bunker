module.exports = {
	play: function(roomId, command) {
		// parse the command and figure out what we are doing in the
		// context of hangman
		return getGame(roomId).then(function(currentGame) {
			var commandParts = command.split(" ");
			if (commandParts.length > 1) {
				var commandName = commandParts[1].toLowerCase();
				switch (commandName) {
					case "start":
						if (commandParts.length == 3) {
							return start(roomId, commandParts[2]);
						}
						else {
							return start(roomId);
						}
						break;
					case "quit":
						return quit(roomId);
						break;
					case "guess":
						if (currentGame) {
							if (commandParts.length == 3) {
								return guess(currentGame, commandParts[2], roomId);
							}
						}else {
							return "Cannot guess, there is not an active hangman game going.";
						}
						break;
				}
			}

			return "Bad hangman command, use /help hangman for help with this feature.";
		});
	}
};

function getGame(roomId) {
	return HangmanGame.findOne({ room: roomId });
}

function quit(roomId) {
	return HangmanGame.destroy({ room: roomId }).then(function() {
		return "This room's hangman instance has been removed.";
	});
}

function guess(currentGame, guessString, roomId) {

	if (guessString.length == 1){
		guessString = guessString.toUpperCase();

		if (currentGame.word.indexOf(guessString) > -1) {
			if (currentGame.hits) {
				if (currentGame.hits.indexOf(guessString) == -1) {
					currentGame.hits += "," + guessString;
				}
			}
			else {
				currentGame.hits = guessString;
			}
		}
		else {
			if (currentGame.misses) {
				if (currentGame.misses.indexOf(guessString) == -1) {
					currentGame.misses += "," + guessString;
				}
			}
			else {
				currentGame.misses = guessString;
			}
		}

		return HangmanGame.update({ room: roomId}, {hits: currentGame.hits, misses: currentGame.misses }).then(function() {
			return buildResponse(currentGame);
		})
	}

	var encouragingMessageIndex = Math.ceil(Math.random() * messagesOfEncouragement.length);
	return "You are only allowed to guess a single letter at a time. " + messagesOfEncouragement[encouragingMessageIndex];
}

function start(roomId, minScrabbleScore) {
	return quit(roomId).then(function() {
		var word = "";
		var randomIndex = 0;

		if (minScrabbleScore) {
			var filteredWords = _.filter(hangmanWordDataService.sevenLetterWords, function(word){
				return word.scrabble >= minScrabbleScore;
			});

			if (filteredWords.length > 0) {
				randomIndex = Math.ceil(Math.random() * filteredWords.length);
				return hangmanWordDataService.sevenLetterWords[randomIndex].word;
			}
		}
		else {
			// we get here by default case of not specifying a min scrabble word score
			// or specifying a scrabble word score that didn't get any data.
			randomIndex = Math.ceil(Math.random() * hangmanWordDataService.sevenLetterWords.length);
			word = hangmanWordDataService.sevenLetterWords[randomIndex].word;
		}

		return HangmanGame.create({
			room: roomId,
			word: word
		}).then(function(newGame) {
			return buildResponse(newGame);
		});
	});
}

function buildResponse(currentGame) {
	var responseString = "";

	var maskedWord = buildWordMask(currentGame.hits, currentGame.word);
	if (maskedWord.indexOf("_") == -1){
		quit(currentGame.room);
		responseString = "You win!  The word was " + currentGame.word + ".";
	}
	else {
		if (currentGame.misses) {
			var missesArray = currentGame.misses.split(",");

			switch (missesArray.length) {
				case 1:
					responseString = ":hangman1:  Word: " + maskedWord + ",  Misses: " + currentGame.misses;
					break;
				case 2:
					responseString = ":hangman2:  Word: " + maskedWord + ",  Misses: " + currentGame.misses;
					break;
				case 3:
					responseString = ":hangman3:  Word: " + maskedWord + ",  Misses: " + currentGame.misses;
					break;
				case 4:
					responseString = ":hangman4:  Word: " + maskedWord + ",  Misses: " + currentGame.misses;
					break;
				case 5:
					responseString = ":hangman5:  Word: " + maskedWord + ",  Misses: " + currentGame.misses;
					break;
				case 6:
					responseString = ":hangman6:  You lose.  The word was " + currentGame.word;
					quit(currentGame.room);
					break;
			}
		}
		else {
			responseString = ":hangman0:  Word: " + buildWordMask(currentGame.hits, currentGame.word);
		}
	}

	return responseString;
}

function buildWordMask(hits, word) {
	if (hits) {
		var mask = "";
		for (index = 0; index < word.length; index++) {
			var letter = word.substring(index, index + 1);
			if (hits.indexOf(letter) == -1) {
				mask += "_ ";
			}
			else {
				mask += letter + " ";
			}
		}

		return mask.trim();
	}
	else {
		return "_  _  _  _  _  _  _";
	}
}

var messagesOfEncouragement = ["There is no hope for you.", "Jackass.", "Hang yourself with your own belt.", "Find a bridge and jump.", "Read the help topic, you are retarded.", "Don't ask jpro, he's dumb too."];

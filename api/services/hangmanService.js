var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports.play = function (roomMember, command) {
	return HangmanGame.findOne({room: roomMember.room}).then(function (currentGame) {
		var match = /^\/h(?:angman)?(?:\s(\w)?|$)/ig.exec(command);
		var guess = match[1];

		if (currentGame && guess) {
			return makeGuess(roomMember, currentGame, guess);
		}
		else if (!currentGame) {
			return start(roomMember);
		}
		// tried to start a game but was already in progress
		return Promise.resolve({error: buildResponse(roomMember, currentGame).message + " (game in progress)"});
	});
};

function makeGuess(roomMember, game, guessString) {
	guessString = guessString.toUpperCase();
	var guessSuccess;
	if (_.includes(game.word, guessString)) {
		guessSuccess = true;
		game.hits.push(guessString);
	}
	else {
		guessSuccess = false;
		game.misses.push(guessString);
	}

	return HangmanGame.update({room: roomMember.room}, {
		hits: game.hits,
		misses: game.misses,
		lastGuessSuccess: guessSuccess
	}).then(function (updatedGame) {
		return buildResponse(roomMember, updatedGame[0]);
	});
}

function start(roomMember) {
	var wordLength = _.sample([4, 5, 6, 7, 8, 9]);

	return getWord(wordLength)
		.then(function (word) {
			return HangmanGame.create({
				room: roomMember.room,
				word: word
			})
		})
		.then(function (game) {
			return buildResponse(roomMember, game);
		});
}

function getWord(lengthOfWord) {
	return request.getAsync({
		json: true,
		// http://developer.wordnik.com/docs.html#!/words/getRandomWord_get_4
		url: 'http://api.wordnik.com/v4/words.json/randomWord',

		// query string
		qs: {
			api_key: '4817cab836f606e6b000b092ab803694d318c37622fd6f4c9',
			minLength: lengthOfWord,
			maxLength: lengthOfWord,

			hasDictionaryDef: true,
			includePartOfSpeech: 'noun, adjective, verb, adverb',

			// only use words people actually know http://www.wordfrequency.info/
			minCorpusCount: 10000,

			// don't use obscure words
			minDictionaryCount: 10
		}
	})
		.spread(function (response, body) {
			return body.word.toUpperCase();
		})
}

function buildResponse(roomMember, game) {
	var responseString = [];
	//var maskedWord = buildWordMask(game.hits, game.word);

	var maskedWord = _.map(game.word, function (letter) {
		return _.includes(game.hits, letter) ? letter: '﹏ ';
	});

	if (!_.contains(maskedWord, '﹏')) {
		HangmanGame.destroy(game.id).then();
		responseString.push(roomMember.user.nick + ' guessed the final letter!  The word was ' + game.word);
	}
	else {
		responseString.push(':hangman');
		responseString.push(game.misses.length);
		responseString.push(': ');

		if (game.misses.length >= 6) {
			responseString.push('You lose! The word was ' + game.word);
			HangmanGame.destroy(game.id).then();
		}
		else {
			responseString.push('Word: ' + maskedWord);
			if (game.misses.length > 0) {
				responseString.push(',  Misses: ' + game.misses.join(', '));
			}
		}

		if (game.hits.length || game.misses.length) {
			// The last guess is the last hit if the guess was successful or the last miss if not
			var lastGuess = _.last(game.lastGuessSuccess ? game.hits : game.misses);
			responseString.push(' (' + roomMember.user.nick + ' guessed ' + lastGuess + ')');
		}
	}

	return {message: responseString.join('')}
}

function buildWordMask(hits, word) {
	return _.map(word, function (letter) {
		return _.includes(hits, letter) ? letter: '﹏ ';
	});
	//
	//if (hits) {
	//	var mask = '';
	//	for (var i = 0; i < word.length; i++) {
	//		var letter = word.substring(i, i + 1);
	//		if (hits.indexOf(letter) == -1) {
	//			mask += '﹏ ';
	//		}
	//		else {
	//			mask += letter + ' ';
	//		}
	//	}
	//
	//	return mask.trim();
	//}
	//else {
	//	return '﹏  ﹏  ﹏  ﹏  ﹏  ﹏  ﹏';
	//}
}


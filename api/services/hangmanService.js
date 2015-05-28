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
		return Promise.resolve({error: buildResponse(currentGame).message + " (Game in Progress)"});
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

	game.hits = _.unique(game.hits);
	game.misses = _.unique(game.misses);

	return HangmanGame.update({room: roomMember.room}, {
		hits: game.hits,
		misses: game.misses,
		lastGuessSuccess: guessSuccess
	}).then(function (updatedGame) {
		updatedGame = updatedGame[0];

		if (updatedGame.misses.length >= 6 || updatedGame.hits.length >= _.unique(updatedGame.word).length) {
			HangmanGame.destroy(game.id).then(); // still seems gross :-/
		}
		return buildResponse(updatedGame, roomMember);
	});
}

function start(roomMember) {
	return getWord()
		.then(function (word) {
			return HangmanGame.create({
				room: roomMember.room,
				word: word
			})
		})
		.then(function (game) {
			return buildResponse(game, roomMember);
		});
}

function getWord() {
	return request.getAsync({
		json: true,
		// http://developer.wordnik.com/docs.html#!/words/getRandomWord_get_4
		url: 'http://api.wordnik.com/v4/words.json/randomWord',

		// query string
		qs: {
			api_key: '4817cab836f606e6b000b092ab803694d318c37622fd6f4c9',
			minLength: 4,
			maxLength: 10,

			hasDictionaryDef: true,
			includePartOfSpeech: 'noun, adjective, verb, adverb',

			// only use words people actually know http://www.wordfrequency.info/
			minCorpusCount: 100,

			// don't use obscure words
			minDictionaryCount: 20
		}
	})
		.spread(function (response, body) {
			return body.word.toUpperCase();
		});
}

function buildResponse(game, roomMember) {
	var nick;
	if (roomMember) {
		nick = roomMember.user.nick;
	}

	var responseString = [];

	var maskedWord = _.map(game.word, function (letter) {
		return (_.includes(game.hits, letter) ? letter : '_') + ' ';
	}).join('');

	responseString.push(':hangman');
	responseString.push(game.misses.length);
	responseString.push(': ');

	responseString.push(maskedWord);
	responseString.push('&nbsp;&nbsp;&nbsp;');

	if(!game.hits.length && !game.misses.length){
		responseString.push(' (' + nick + ' started a game of Hangman!)');
	}

	if (game.misses.length > 0) {
		responseString.push('[Misses: ' + game.misses.join(', ') + ']');
	}

	if (nick && (game.hits.length || game.misses.length)) {
		// The last guess is the last hit if the guess was successful or the last miss if not
		var lastGuess = _.last(game.lastGuessSuccess ? game.hits : game.misses);
		responseString.push(' (' + nick + ' guessed ' + lastGuess + ')');
	}

	if (game.hits.length >= _.unique(game.word).length) {
		responseString.push(' You Won! :successkid: Definition: |' + game.word.toLowerCase() + '|');
	}

	if (game.misses.length >= 6) {
		responseString.push(' You Lose! :smaug: The word was |' + game.word.toLowerCase() + '|');
	}

	return {message: responseString.join('')}
}


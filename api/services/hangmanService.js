var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports.play = function (roomMember, command) {
	return HangmanGame.findOne({room: roomMember.room}).then(function (currentGame) {
		var match = /^\/h(?:angman)?(?:\s(\w*)?|$)/ig.exec(command);
		var guess = match[1];

		if (currentGame && guess) {
			return makeGuess(roomMember, currentGame, guess);
		}
		else if (!currentGame && !guess) {
			return start(roomMember);
		}
		else if (!currentGame && guess){
			// tried to guess but no game in progress. Prevents new games from being started during wild guessing
			return Promise.resolve({error: "Type /hangman to start a new game"});
		}
		// tried to start a game but was already in progress
		return Promise.resolve({error: buildResponse(currentGame).message + " (Game in Progress)"});
	});
};

function makeGuess(roomMember, game, guess) {
	guess = guess.toUpperCase();

	// guessing the word
	if(guess.length > 1 && guess == game.word){
		game.hits.push(guess);
	}
	// letter guess
	else if (guess.length == 1 && _.includes(game.word, guess)) {
		game.hits.push(guess);
	}
	else {
		game.misses.push(guess);
	}

	game.hits = _.unique(game.hits);
	game.misses = _.unique(game.misses);

	var maxCountReached = game.misses.length >= 6;
	var allLettersMatched = game.hits.length >= _.unique(game.word).length;
	var wordGuessed = game.word == guess;

	var update = HangmanGame.update({room: roomMember.room}, {
		hits: game.hits,
		misses: game.misses
	});

	var remove = HangmanGame.destroy(game.id);

	// if the game is over, remove it from the database. Otherwise update it
	var action = (maxCountReached || allLettersMatched || wordGuessed) ? remove : update;

	return Promise.join(
		buildResponse(game, roomMember, guess),
		action
	)
		.spread(function (response, dbGame) {
			return response;
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

function buildResponse(game, roomMember, guess) {
	var nick;
	if (roomMember) {
		nick = roomMember.user.nick;
	}

	var wordGuessed = game.word == guess;
	var responseString = [];
	var maskedWord;

	if(wordGuessed){
		maskedWord = _.map(guess).join(' ');
	}
	else {
		maskedWord = _.map(game.word, function (letter) {
			if(letter.length == 1 &&  _.includes(game.hits, letter)) {
				return letter;
			}
			return '_';
		}).join(' ');
	}

	responseString.push(':hangman');
	responseString.push(game.misses.length);
	responseString.push(': ');

	responseString.push(maskedWord);
	responseString.push('&nbsp;&nbsp;&nbsp;');

	if(nick && !game.hits.length && !game.misses.length){
		responseString.push(' (' + nick + ' started a game of Hangman!)');
	}

	if (game.misses.length > 0) {
		responseString.push('[Misses: ' + game.misses.join(', ') + ']');
	}

	if (guess) {
		responseString.push(' (' + nick + ' guessed ' + guess + ')');
	}

	var allLettersMatched = game.hits.length >= _.unique(game.word).length;
	if (allLettersMatched || wordGuessed) {
		responseString.push(' You Won! :successkid: Definition: |' + game.word.toLowerCase() + '|');
	}

	if (game.misses.length >= 6) {
		responseString.push(' You Lose! :smaug: The word was |' + game.word.toLowerCase() + '|');
	}

	return {message: responseString.join('')}
}


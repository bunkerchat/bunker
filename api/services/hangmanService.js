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
		else if (!currentGame && guess) {
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
	if (guess.length > 1 && guess == game.word) {
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

	var update = HangmanGame.update({room: roomMember.room}, {
		hits: game.hits,
		misses: game.misses
	});

	var remove = HangmanGame.destroy(game.id);

	// if the game is over, remove it from the database. Otherwise update it
	var action = checkForEndGame(game, guess) ? remove : update;

	return Promise.join(
		buildResponse(game, roomMember, guess),
		action
	)
		.spread(function (response, dbGame) {
			return response;
		});
}

function checkForEndGame(game, guess){
	var maxCountReached = game.misses.length >= 6;
	return (maxCountReached || allLettersMatched(game) || wordGuessed(game, guess));
}

function allLettersMatched(game){
	return game.hits.length >= _.unique(game.word).length
}

function wordGuessed(game, guess){
	return game.word == guess;
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

	var responseString = [];

	responseString.push(':hangman');
	responseString.push(game.misses.length);
	responseString.push(': ');

	if (checkForEndGame(game, guess)) {
		// if end of game, put pipes around word for client side regex to generate link
		responseString.push('|');
		responseString.push(_.map(game.word).join(' '));
		responseString.push('|');
	}
	else {
		// otherwise create word mask
		var maskedWord = _.map(game.word, function (letter) {
			if (letter.length == 1 && _.includes(game.hits, letter)) {
				return letter;
			}
			return '_';
		}).join(' ');
		responseString.push(maskedWord);
	}

	responseString.push('&nbsp;&nbsp;&nbsp;');

	if (nick && !game.hits.length && !game.misses.length) {
		responseString.push(' (' + nick + ' started a game of Hangman!)');
	}

	if (game.misses.length > 0) {
		responseString.push('[Misses: ' + game.misses.join(', ') + ']');
	}

	if (guess) {
		responseString.push(' (' + nick + ' guessed ' + guess + ')');
	}

	if (allLettersMatched(game) || wordGuessed(game, guess)) {
		responseString.push(' You Won! :' + getWinEmote() + ':');
	}

	if (game.misses.length >= 6) {
		responseString.push(' You Lose! :' + getLoseEmote() + ':');
	}

	return {message: responseString.join('')}
}

function getWinEmote() {
	return _.sample([
		'bravo',
		'excellent',
		'successkid',
		'allthethings',
		'golfclap',
		'smug',
		'woop',
		'notbad',
		'damn',
		'yaycloud',
		'excellent',
		'indeed',
		'hellyeah',
		'likeasir',
		'likeaboss',
		'hansolo',
		'nyan',
		'pipedog',
		'quagmire',
		'thumbsup',
		'twss'
	]);
}

function getLoseEmote() {
	return _.sample([
		'argh',
		'bang',
		'confused',
		'crushed',
		'devil',
		'disapproval',
		'duckhunt',
		'facepalm',
		'fuuu',
		'fwp',
		'grumpycat',
		'mediocre',
		'mystery',
		'notsureif',
		'omgwhy',
		'okay',
		'psyduck',
		'qq',
		'rant',
		'sadpanda',
		'sigh',
		'smaug',
		'stare2',
		'thumbsdown',
		'wat'
	]);
}
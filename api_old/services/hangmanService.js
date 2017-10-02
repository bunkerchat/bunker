var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports.play = function (roomMember, command) {
	return getHangmanGame(roomMember).then(function(currentGame){
		var match = /^\/h(?:angman)?(?:\s(\w*)?|$)/ig.exec(command);
		var guess = match[1];

		var private = /^\/h(?:angman)?(?:(\s\-p(?:rivate?|$))?|$)/.exec(command);
		var isPrivate = private[1] ? true : false;

		if (currentGame && guess) {
			// async fetch of both statistics objects
			return Promise.join(
					getHangmanUserStatistics(roomMember.user._id),
					getHangmanPublicStatistics()
				)
				.spread(function (userStats, publicStats) {
					return makeGuess(roomMember, currentGame, guess, userStats, publicStats);
				});
		}
		else if (currentGame && currentGame.isPrivate == false && !guess && isPrivate) {
			// you can start a private game if a public game is in progress
			return start(roomMember, isPrivate);
		}
		else if (!currentGame && !guess) {
			return start(roomMember, isPrivate);
		}
		else if (!currentGame && guess) {
			// tried to guess but no game in progress. Prevents new games from being started during wild guessing
			return Promise.resolve({error: "Type /hangman to start a new game"});
		}
		// tried to start a game but was already in progress
		return Promise.resolve({error: buildResponse(currentGame).message + " (Game in Progress)"});
	});
};

function getHangmanGame(roomMember) {
	// always look for a private game first.  A user can't play a public game if they
	// are already doing a private game.
	return HangmanGame.findOne({user: roomMember.user._id, isPrivate: true}).then(function (currentPrivateGame) {
		if (currentPrivateGame) {
			return currentPrivateGame;
		}
		else {
			// look for an existing public game
			return HangmanGame.findOne({room: roomMember.room, isPrivate: false});
		}
	});
}

function getHangmanUserStatistics(userId) {
	return HangmanUserStatistics.findOne({user: userId}).then(function (hangmanUserStatistics) {
		if (hangmanUserStatistics) return hangmanUserStatistics;

		return HangmanUserStatistics.create({
			user: userId
		});
	});
}

function getHangmanPublicStatistics() {
	return HangmanPublicGameStatistics.find().then(function (publicStats) {
		if (publicStats && publicStats[0]) return publicStats[0];

		return HangmanPublicGameStatistics.create();
	});
}

function makeGuess(roomMember, game, guess, userStats, publicStats) {
	guess = guess.toUpperCase();

	// guessing the word
	if (guess.length > 1 && guess == game.word) {
		game.hits.push(guess);
		userStats.guessHits++;
	}
	// letter guess
	else if (guess.length == 1 && _.includes(game.word, guess)) {
		game.hits.push(guess);
		userStats.guessHits++;
	}
	else {
		game.misses.push(guess);
		userStats.guessMisses++;
	}

	game.hits = _.unique(game.hits);
	game.misses = _.unique(game.misses);

	// if the game is over, remove it from the database. Otherwise update it
	var action = checkForEndGame(game, guess) ? completeHangmanGame(game, guess, userStats, publicStats) : game.save();

	return Promise.join(
		buildResponse(game, roomMember, guess),
		action,
		userStats.save()
	)
		.spread(function (response, dbGame, userStats) {
			return response;
		});
}

function completeHangmanGame(game, guess, userStats, publicStats){
	// check for win
	if (allLettersMatched(game) || wordGuessed(game, guess)) {
		if (game.isPrivate) {
			userStats.privateGameWinCount++;
		} else {
			publicStats.winCount++;
		}
	} else {
		// loss
		if (game.isPrivate) {
			userStats.privateGameLossCount++;
		} else {
			publicStats.lossCount++;
		}
	}

	var action = game.isPrivate ? userStats.save() : publicStats.save();

	return Promise.join(
		HangmanGame.destroy(game._id),
		action);
}

function checkForEndGame(game, guess) {
	var maxCountReached = game.misses.length >= 6;
	return (maxCountReached || allLettersMatched(game) || wordGuessed(game, guess));
}

function allLettersMatched(game) {
	return game.hits.length >= _.unique(game.word).length
}

function wordGuessed(game, guess) {
	return game.word == guess;
}

function start(roomMember, isPrivate) {
	return getWord()
		.then(function (word) {
			if (isPrivate) {
				return HangmanGame.create({
					user: roomMember.user._id,
					word: word,
					isPrivate: true
				});
			} else {
				return HangmanGame.create({
					room: roomMember.room,
					word: word,
					isPrivate: false
				});
			}
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
			return body.word.replace('-', '').toUpperCase();
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
		if (game.isPrivate) {
			responseString.push(' (' + nick + ' started a private game of Hangman!)');
		} else {
			responseString.push(' (' + nick + ' started a game of Hangman!)');
		}
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

	return {message: responseString.join(''), isPrivate: game.isPrivate}
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

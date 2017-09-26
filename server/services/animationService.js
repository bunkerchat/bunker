const animationService = module.exports
const _ = require('lodash')
const InvalidInputError = require('../errors/InvalidInputError');

animationService.getWordsToAnimate = text =>{
	const emoticonMatches = /\/show\s+:?(\w+):?/.exec(text);
	if (!emoticonMatches || emoticonMatches.length < 1) {
		throw new InvalidInputError('Invalid show format — example: /show doge');
	}

	const emoticon = emoticonMatches[1];
	let words = [];

	switch (emoticon) {
		case 'doge':
			words.push('bunker', 'chat', 'wow', 'messages', 'communicatoins',
				'http', 'sockets', 'emoticons', 'real time', 'trollign', 'features',
				'open source', 'message history', 'typing', 'jpro', 'javascritp',
				':successkid:', '/show :doge:', roomMember.user.nick);
			words = _.map(words, function (word) {
				const random = _.random(0, 100, false);
				if (random > 92) return 'such ' + word;
				if (random > 82 && random < 90) return 'much ' + word;
				if (random > 72 && random < 80) return 'so ' + word;
				if (random < 7) return 'very ' + word;
				if (random > 55 && random < 60) return word + ' lol';
				return word;
			});
			break;
		case 'slap':
			words.push('five fingers', 'SLAP', 'darknesssss', 'to the face', 'CHARLIE MURPHY', 'I\'m rick james',
				'darkness everybody', 'upside his head', 'cold blooded', 'bang bang');
			break;
		case 'ricers':
			words.push('omg', 'spoiler', 'RPM', 'zoom zoom', 'VROOOOOOMM', 'beep beep', 'slow drivers', 'fast lane',
				'WRX', 'too fast too furious', 'torque', 'horsepower');
			break;
		case 'trollface':
			words.push('trollololol', 'T-R-rolled');
			break;
		case 'itsatrap':
			words.push('it\'s a trap!', 'attack formation', 'all craft prepare to retreat',
				'firepower', 'evasive action', 'engage those star destroyers');
			break;
		case 'smaug':
			words.push('SHMAAAUGGG');
			break;
		case 'hansolo':
			words.push('i shot first', 'laugh it up fuzzball',
				'sorry about the mess', 'don\'t get cocky', 'let\'s blow this thing and go home', 'smuggling',
				'money', 'bounty', 'debt', 'carbonite', 'scoundrel');
			break;
		case 'chrome':
			words.push('i live i die i live again', 'valhalla',
				'V8', 'chrome grill', 'cars', 'mah steering wheel',
				'chapped lips', 'trucks', 'engines', 'fast', 'desert', 'wasteland', 'war');
			break;
		case 'canada':
			words.push('maple syrup', 'hosers', 'hockey', 'ice', 'snow', 'arctic circle', 'eskimos',
				'nunavut', 'canucks', 'mounties', 'eh', 'sorry', 'bacon', 'aboot');
			break;
		case 'burrito':
			words.push('beans', 'carnitas', 'tortilla', 'noms', 'steak', 'farm fresh', 'double-wrapped',
				'rice', 'free guac lol', 'bowl > tortilla', 'foil wrapped for warmth', 'pancheros > chipotle');
			break;
		case 'magic8ball':
			words.push('all-knowing', 'omniscient', 'round', 'number 8', 'bawlz', 'predictions', 'shaking',
				'future', 'revealing', 'how does it know?', 'not good 4 billiardz lol');
			break;
	}

	words = _.sampleSize(words, 10)

	return {words, emoticon}
}

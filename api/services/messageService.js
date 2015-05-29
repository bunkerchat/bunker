var ent = require('ent');
var moment = require('moment');
var Promise = require('bluebird');

var ForbiddenError = require('../errors/ForbiddenError');
var InvalidInputError = require('../errors/InvalidInputError');

module.exports.createMessage = function (roomMember, text) {

	text = ent.encode(text);

	if (!text || !text.length) {
		throw new InvalidInputError(); // block the trolls
	}
	else if (/^\/nick\s+/i.test(text)) {
		return setUserNick(roomMember, text); // Change the current user's nick
	}
	else if (/^\/(away|afk|busy)/i.test(text)) {
		return setUserBusy(roomMember, text); // away, afk, busy (with optional message)
	}
	else if (/^\/help/i.test(text)) {
		return getHelp(roomMember, text);
	}
	else if (/^\/stats/i.test(text)) {
		return stats(roomMember, text);
	}
	else if (/^\/topic/i.test(text)) { // Change room topic
		return setRoomTopic(roomMember, text);
	}
	else if (/^\/room\s+topic/i.test(text)) {
		return setRoomTopic(roomMember, text)
	}
	else if (/^\/room\s+name\s+\w/i.test(text)) {
		return setRoomName(roomMember, text)
	}
	else if (/^\/magic8ball/i.test(text)) {
		return magic8ball(roomMember, text); // Jordan's Magic 8 Ball, Bitches
	}
	else if (/^\/roll/i.test(text)) {
		return roll(roomMember, text);
	}
	else if (/^\/show\s+:\w+:/i.test(text)) {
		return animation(roomMember, text);
	}
	else if (/^\/me\s+/i.test(text)) {
		return me(roomMember, text);
	}
	else if (/^\/h(?:angman)?(?:\s(\w)?|$)/i.test(text)) {
		return hangman(roomMember, text);
	}
	else if (/^\/code /i.test(text)) {
		return code(roomMember, text);
	}
	else {
		return message(roomMember, text, 'standard');
	}
};

module.exports.broadcastMessage = broadcastMessage;

function getHelp(roomMember, text) {
	return helpService.getHelp(text).then(function (helpMessage) {
		return RoomService.messageUserInRoom(roomMember.user.id, roomMember.room, helpMessage, 'help');
	});
}

function stats(roomMember, text) {
	var match = /^\/stats\s+([\d\w\s\-\.]+)$/ig.exec(text);

	if (match) {
		var userNick = match[1];
		return statsService.getStatsForUser(userNick, roomMember.room)
			.then(function (stats) {
				return Message.create({
					room: roomMember.room,
					type: 'stats',
					author: roomMember.user,
					text: stats
				})
					.then(broadcastMessage);
			})
	}

	return statsService.getStats(roomMember)
		.then(function (message) {
			RoomService.messageUserInRoom(roomMember.user.id, roomMember.room, message, 'stats');
		})
}

function animation(roomMember, text) {

	var emoticon = (/:\w+:/.exec(text))[0];

	var words = [];
	switch (emoticon) {
		case ':doge:':
			words.push('bunker', 'chat', 'wow', 'messages', 'communicatoins',
				'http', 'sockets', 'emoticons', 'real time', 'trollign', 'features',
				'open source', 'message history', 'typing', 'jpro', 'javascritp',
				':successkid:', '/show :doge:', roomMember.user.nick);
			words = _.map(words, function (word) {
				var random = _.random(0, 100, false);
				if (random > 92) return 'such ' + word;
				if (random > 82 && random < 90) return 'much ' + word;
				if (random > 72 && random < 80) return 'so ' + word;
				if (random < 7) return 'very ' + word;
				if (random > 55 && random < 60) return word + ' lol';
				return word;
			});
			break;
		case ':slap:':
			words.push('five fingers', 'SLAP', 'darknesssss', 'to the face', 'CHARLIE MURPHY', 'I\'m rick james',
				'darkness everybody', 'upside his head', 'cold blooded', 'bang bang');
			break;
		case ':ricers:':
			words.push('omg', 'spoiler', 'RPM', 'zoom zoom', 'VROOOOOOMM', 'beep beep', 'slow drivers', 'fast lane',
				'WRX', 'too fast too furious', 'torque', 'horsepower');
			break;
		case ':trollface:':
			words.push('trollololol', 'T-R-rolled');
			break;
		case ':itsatrap:':
			words.push('it\'s a trap!', 'attack formation', 'all craft prepare to retreat',
				'firepower', 'evasive action', 'engage those star destroyers');
			break;
		case ':smaug:':
			words.push('SCMAAAUGGG');
			break;
		case ':hansolo:':
			words.push('i shot first', 'laugh it up fuzzball',
				'sorry about the mess', 'don\'t get cocky', 'let\'s blow this thing and go home', 'smuggling',
				'money', 'bounty', 'debt', 'carbonite', 'scoundrel');
			break;
		case ':chrome:':
			words.push('i live i die i live again', 'valhalla',
				'V8', 'chrome grill', 'cars', 'mah steering wheel',
				'chapped lips', 'trucks', 'engines', 'fast', 'desert', 'wasteland', 'war');
			break;
		case ':canada:':
			words.push('maple syrup', 'hosers', 'hockey', 'ice', 'snow', 'arctic circle', 'eskimos',
				'nunavut', 'canucks', 'mounties', 'eh', 'sorry', 'bacon', 'aboot');
			break;
		case ':burrito:':
			words.push('beans', 'carnitas', 'tortilla', 'noms', 'steak', 'farm fresh', 'double-wrapped',
				'rice', 'free guac lol', 'bowl > tortilla', 'foil wrapped for warmth', 'pancheros > chipotle');
			break;
		case ':magic8ball:':
			words.push('all-knowing', 'omniscient', 'round', 'number 8', 'bawlz', 'predictions', 'shaking',
				'future', 'revealing', 'how does it know?', 'not good 4 billiardz lol');
			break;
	}

	RoomService.animateInRoom(roomMember, emoticon, _.sample(words, 10));
}

function setUserNick(roomMember, text) {
	var nickMatches = text.match(/^\/nick\s+(\w[\w\s\-\.]{0,19})/i);
	if (!nickMatches) throw new InvalidInputError('Invalid nick');

	var user = roomMember.user;
	var newNick = nickMatches[1];
	if (user.nick == newNick) throw new InvalidInputError('Nick is already set');

	return Promise.join(
		User.update(user.id, {nick: newNick}),
		RoomMember.find({user: user.id})
	)
		.spread(function (updatedUser, memberships) {
			updatedUser = updatedUser[0];
			User.publishUpdate(user.id, {nick: updatedUser.nick});
			RoomService.messageRooms(_.pluck(memberships, 'room'), user.nick + ' changed their handle to ' + updatedUser.nick);
		});
}

function setUserBusy(roomMember, text) {
	return RoomMember.find({user: roomMember.user.id})
		.then(function (memberships) {

			var user = roomMember.user;
			var busy = !user.busy; // Flip busy status
			var busyMessageMatches = text.match(/^\/(?:away|afk|busy)\s*(.+)/i);
			var busyMessage = busy && busyMessageMatches ? busyMessageMatches[1] : null;

			return [User.update(user.id, {busy: busy, busyMessage: busyMessage}), memberships];
		})
		.spread(function (user, memberships) {
			user = user[0];

			var message = [];
			message.push(user.nick);
			message.push(user.busy ? 'is now away' : 'is back');
			if (user.busy && user.busyMessage) {
				message.push(': ' + user.busyMessage);
			}

			RoomService.messageRooms(_.pluck(memberships, 'room'), message.join(' '));
			User.publishUpdate(user.id, {busy: user.busy, busyMessage: user.busyMessage});
		});
}

function setRoomTopic(roomMember, text) {

	if (roomMember.role == 'member') {
		throw new ForbiddenError('Must be an administrator to change topic');
	}

	var user = roomMember.user;
	var roomId = roomMember.room;
	var topicMatches = text.match(/topic\s+(.+)/i);
	var topic = topicMatches ? topicMatches[1].substr(0, 200) : null;

	return Room.update(roomId, {topic: topic}).then(function (room) {
		room = room[0];
		var message = user.nick + (room.topic ? ' changed the topic to "' + room.topic + '"' : ' cleared the topic');

		Room.publishUpdate(roomId, {topic: room.topic});
		RoomService.messageRoom(roomId, message);
	});
}

function setRoomName(roomMember, text) {

	if (roomMember.role == 'member') {
		throw new ForbiddenError('Must be an administrator to change room name');
	}

	var user = roomMember.user;
	var roomId = roomMember.room;

	var nameMatches = text.match(/\/room\s+name\s+([\w\s]+)/i);
	if (!nameMatches) throw new InvalidInputError('Invalid room name');

	var name = nameMatches[1].substr(0, 50);

	return Room.update(roomId, {name: name}).then(function (room) {
		room = room[0];
		var message = user.nick + ' changed the room name to "' + room.name + '"';

		Room.publishUpdate(roomId, {name: room.name});
		RoomService.messageRoom(roomId, message);
	});
}

function magic8ball(roomMember, text) {
	var ballResponse = _.sample([
		"It is certain", "It is decidedly so", "Yes definitely",
		"You may rely on it", "As I see it, yes",
		"Most likely", "Outlook good", "Yes", "Signs point to yes", "Without a doubt",
		"Ask again later", "Better not tell you now",
		"Cannot predict now", "Concentrate and ask again", "Reply hazy, try again",
		"Don't count on it", "My reply is no",
		"My sources say no", "Outlook not so good", "Very doubtful"
	]);

	setTimeout(function () {
		return Message.create({
			room: roomMember.room,
			author: null,
			type: '8ball',
			text: ':magic8ball: ' + ballResponse
		}).then(broadcastMessage);
	}, 3000);

	var question = ' shakes the magic 8 ball...';
	var questionMatch = text.match(/\/magic8ball\s+(.+)/i);
	if (questionMatch) {
		question = ' shakes the magic 8 ball and asks "' + questionMatch[1] + '"';
	}

	return message(roomMember, roomMember.user.nick + question, 'room');
}

function roll(roomMember, text) {
	var matches = text.match(/\/roll\s+(.+)/i);
	var roll = matches ? matches[1] : null;
	var rollOutcome;

	// Generic number roll
	if (/^\d+$/.test(roll)) {
		var max = Math.round(+roll);
		rollOutcome = 'rolled ' + Math.ceil(Math.random() * max) + ' out of ' + max;
	}
	// d20 case for D&D nerds
	else if (/^\d*d\d*$/i.test(roll)) { // a dice roll
		var textParse = /(\d*)d(\d*)/.exec(roll);
		var diceCount = parseInt(textParse[1]) || 1; // Default at least one die (converts /roll d10 to /roll 1d10)
		var dieSides = parseInt(textParse[2]) || 6; // Default at six sided die (converts /roll 10d to /roll 10d6)

		if (diceCount > 25) diceCount = 25;
		if (dieSides > 50) dieSides = 50;

		var total = 0;
		var dieString = [];
		for (var i = 0; i < diceCount; i++) {
			var die = Math.ceil(Math.random() * dieSides);
			total += die;
			dieString.push('[' + die + ']');
		}

		rollOutcome = 'rolled ' + diceCount + 'd' + dieSides + ' for ' + total + ': ' + dieString.join(' ');
	}
	else { // Doesn't fit any of our cases
		rollOutcome = 'rolled ' + Math.ceil(Math.random() * 100) + ' out of ' + 100;
	}

	return message(roomMember, ':rolldice: ' + roomMember.user.nick + ' ' + rollOutcome, 'roll');
}

function me(roomMember, text) {
	return message(roomMember, roomMember.user.nick + text.substring(3), 'emote');
}

function message(roomMember, text, type) {

	type = type || 'standard';

	return Message.create({
		room: roomMember.room,
		type: type,
		author: type == 'standard' ? roomMember.user : null,
		text: text
	}).then(function (message) {
		broadcastMessage(message);
		saveInMentionedInboxes(message);
		return message;
	});
}

function broadcastMessage(message) {
	// now that message has been created, get the populated version
	return Message.findOne(message.id).populateAll().exec(function (error, message) {
		Room.message(message.room, message); // message all subscribers of the room that with the new message as data
	});
}

function saveInMentionedInboxes(message) {
	if (!message.author) return;

	// Check if this message mentions anyone
	// Completely async process that shouldn't disrupt the normal message flow
	return Promise.join(
		User.findOne(message.author),
		RoomMember.find({room: message.room}).populate('user')
	)
		.spread(function (author, roomMembers) {
			return Promise.each(roomMembers, function (roomMember) {
				var regex = new RegExp(roomMember.user.nick + '\\b|@[Aa]ll', 'i');
				if (regex.test(message.text)) {
					return InboxMessage.create({user: roomMember.user.id, message: message.id})
						.then(function (inboxMessage) {
							return InboxMessage.findOne(inboxMessage.id).populateAll();
						})
						.then(function (inboxMessage) {
							inboxMessage.message.author = author; // Attach populated author data
							InboxMessage.message(roomMember.user.id, inboxMessage);
						});
				}
			});
		});
}

function code(roomMember, text) {
	// strip out /code
	text = text.substr(6);
	return Message.create({
		room: roomMember.room,
		type: 'code',
		author: roomMember.user,
		text: text
	}).then(broadcastMessage)
}

function hangman(roomMember, text) {
	return hangmanService.play(roomMember, text)
		.then(function (hangmanResponse) {
			if (hangmanResponse.error) {
				return RoomService.messageUserInRoom(roomMember.user.id, roomMember.room, hangmanResponse.error, 'hangman');
			}
			return message(roomMember, hangmanResponse.message, 'hangman');
		});
}

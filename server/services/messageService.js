const ent = require('ent');
const moment = require('moment');
const Promise = require('bluebird');
const socketio = require('../config/socketio');

const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const InboxMessage = require('../models/InboxMessage');

const RoomService = require('./RoomService');
const imageSearch = require('./imageSearch');
const helpService = require('./helpService');
const statsService = require('./statsService');
const leaderboardService = require('./leaderboardService');
const hangmanService = require('./hangmanService');
const pollService = require('./pollService');
const fightService = require('./fightService');
const animationService = require('./animationService')

const ForbiddenError = require('../errors/ForbiddenError');
const InvalidInputError = require('../errors/InvalidInputError');

const messageService = module.exports;

messageService.createMessage = function (roomMember, text) {

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
	//else if (/^\/stats/i.test(text)) {
	//	return stats(roomMember, text);
	//}
	else if (/^\/leaderboard/i.test(text)) {
		return leaderboard(roomMember, text);
	}
	else if (/^\/(topic|name|privacy|icon)/i.test(text)) {
		return RoomService.setRoomAttribute(roomMember, text);
	}
	else if (/^\/magic8ball/i.test(text)) {
		return magic8ball(roomMember, text); // Jordan's Magic 8 Ball, Bitches
	}
	else if (/^\/roll/i.test(text)) {
		return roll(roomMember, text);
	}
	else if (/^\/show\s+:?\w+:?/i.test(text)) {
		return animation(roomMember, text);
	}
	else if (/^\/me\s+/i.test(text)) {
		return me(roomMember, text);
	}
	else if (/^\/h(?:angman)?(?:\s(\w)?|$)/i.test(text)) {
		return hangman(roomMember, text);
	}
	else if (/^\/f(?:ight)?(?:\s(\w)?|$)/i.test(text)) {
		return fight(roomMember, text);
	}
	else if (/^\/code /i.test(text)) {
		return code(roomMember, text);
	}
	else if (/^\/image(?:pick|search)*\s+/i.test(text)) {
		return image(roomMember, text);
	}
	else if (/^\/gif(?:pick|search)*\s+/i.test(text)) {
		return gif(roomMember, text);
	}
	else if (/^\/(promote|demote)\s+([\w\s\-\.]{0,19})/i.test(text)) {
		return changeUserRole(roomMember, text);
	}
	else if (/^\/setinfo\s+/i.test(text)) {
		return setInfo(roomMember, text);
	}
	else if (/^\/whois\s+/i.test(text)) {
		return whois(roomMember, text);
	}
	else if (/^\/poll?(?:\s+(.+)?|$)/i.test(text)) {
		return poll(roomMember, text);
	}
	else if (/^\/vote\s+/i.test(text)) {
		return vote(roomMember, text);
	}
	else if (/^\/poll(\s?)close?(?:\s*)/i.test(text)) {
		return pollClose(roomMember, text);
	}
	else if (/^\/meme/i.test(text)) {
		return meme(roomMember, text);
	}
	else if (/^\/\w+/i.test(text)) {
		return badCommand(roomMember, text);
	}
	else {
		return message(roomMember, text, 'standard');
	}
};

messageService.broadcastMessage = broadcastMessage;

function getHelp(roomMember, text) {
	return helpService.getHelp(text)
		.then(helpMessage => RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, helpMessage, 'help'));
}

function stats(roomMember, text) {
	const match = /^\/stats\s+([\d\w\s\-\.]+)$/ig.exec(text);

	if (match) {
		const userNick = match[1];
		return statsService.getStatsForUser(userNick, roomMember.room)
			.then(function (stats) {
				return Message.create({
					room: roomMember.room,
					type: 'stats',
					author: roomMember.user._id,
					text: stats
				})
					.then(broadcastMessage);
			});
	}

	return statsService.getStats(roomMember)
		.then(function (message) {
			RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, message, 'stats');
		});
}

function animation(roomMember, text) {
	const {words, emoticon} = animationService.getWordsToAnimate(text)
	RoomService.animateInRoom(roomMember, emoticon, words);
}

function setUserNick(roomMember, text) {
	const nickMatches = text.match(/^\/nick\s+([\w\s\-\.]{0,19})/i);
	if (!nickMatches || !nickMatches[1]) throw new InvalidInputError('Invalid nick');

	const user = roomMember.user;
	const newNick = nickMatches[1];
	if (user.nick === newNick) throw new InvalidInputError('Nick is already set');

	return Promise.join(
		User.findByIdAndUpdate(user._id, {nick: newNick}, {new: true}),
		RoomMember.find({user: user._id})
	)
		.spread(function (updatedUser, memberships) {
			socketio.io.to('user_' + updatedUser._id)
				.emit('user', {
					_id: updatedUser._id,
					verb: 'updated',
					data: {nick: updatedUser.nick}
				});
			RoomService.messageRooms(_.map(memberships, 'room'), user.nick + ' changed their handle to ' + updatedUser.nick);
		});
}

function setUserBusy(roomMember, text) {
	return RoomMember.find({user: roomMember.user._id})
		.then(function (memberships) {

			const user = roomMember.user;
			const busy = !user.busy; // Flip busy status
			const busyMessageMatches = text.match(/^\/(?:away|afk|busy)\s*(.+)/i);
			const busyMessage = busy && busyMessageMatches ? busyMessageMatches[1] : null;

			return [User.findByIdAndUpdate(user._id, {busy: busy, busyMessage: busyMessage}, {new: true}), memberships];
		})
		.spread(function (user, memberships) {
			const message = [];
			message.push(user.nick);
			message.push(user.busy ? 'is now away' : 'is back');
			if (user.busy && user.busyMessage) {
				message.push(': ' + user.busyMessage);
			}

			RoomService.messageRooms(_.map(memberships, 'room'), message.join(' '));

			socketio.io.to('user_' + user._id)
				.emit('user', {
					_id: user._id,
					verb: 'updated',
					data: {busy: user.busy, busyMessage: user.busyMessage}
				});
		});
}

function magic8ball(roomMember, text) {
	const ballResponse = _.sample([
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
		})
			.then(broadcastMessage);
	}, 3000);

	var question = ' shakes the magic 8 ball...';
	const questionMatch = text.match(/\/magic8ball\s+(.+)/i);
	if (questionMatch) {
		question = ' shakes the magic 8 ball and asks "' + questionMatch[1] + '"';
	}

	return message(roomMember, roomMember.user.nick + question, 'room');
}

function meme(roomMember, text) {
	if (/\/meme\s*$/.test(text)) {
		return RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, require('./memeService').getHelp(), 'help');
	}

	const matches = text.match(/\/meme\s+(\w+)\s+([\w\s]+)\s*[|\/]?\s*([\w\s]+)?\s*[|\/]?\s*([\w\s]+)?\s*[|\/]?\s*([\w\s]+)?\s*[|\/]?\s*([\w\s]+)?\s*[|\/]?\s*([\w\s]+)?/i);
	if (!matches || matches.length < 3) {
		throw new InvalidInputError(`Invalid meme format - example: /meme tb line 1 text | line 2 text`);
	}
	const image = matches[1];
	const lines = _(matches.slice(2))
		.filter()
		.map(value => encodeURIComponent(value))
		.join('/')

	const url = `http://upboat.me/${image}/${lines}.jpg`;
	return message(roomMember, url);
}

function badCommand(roomMember, text) {
	const matches = text.match(/\/(\w+)/i);
	const command = matches[1]
	throw new InvalidInputError(`Invalid command — ${command}`);
}

function roll(roomMember, text) {
	const matches = text.match(/\/roll\s+(.+)/i);
	const roll = matches ? matches[1] : null;
	var rollOutcome;

	// Generic number roll
	if (/^\d+$/.test(roll)) {
		const max = Math.round(+roll);
		rollOutcome = 'rolled ' + Math.ceil(Math.random() * max) + ' out of ' + max;
	}
	// d20 case for D&D nerds
	else if (/^\d*d\d*$/i.test(roll)) { // a dice roll
		const textParse = /(\d*)d(\d*)/.exec(roll);
		var diceCount = parseInt(textParse[1]) || 1; // Default at least one die (converts /roll d10 to /roll 1d10)
		var dieSides = parseInt(textParse[2]) || 6; // Default at six sided die (converts /roll 10d to /roll 10d6)

		if (diceCount > 25) diceCount = 25;
		if (dieSides > 50) dieSides = 50;

		var total = 0;
		const dieString = [];
		for (var i = 0; i < diceCount; i++) {
			const die = Math.ceil(Math.random() * dieSides);
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
		author: type === 'standard' ? roomMember.user : null,
		text: text
	})
		.then(function (message) {
			broadcastMessage(message);
			saveInMentionedInboxes(message);
			return populateMessage(message);
		});
}

function broadcastMessage(message) {
	return Message.findById(message._id)
		.populate('author')
		.then(function (message) {
			socketio.io.to('room_' + message.room)
				.emit('room', {
					_id: message.room,
					verb: 'messaged',
					data: message
				});
		});
}

function populateMessage(message) {
	return Message.findById(message._id)
		.lean()
		.populate('author')
}

function saveInMentionedInboxes(message) {
	if (!message.author) return;

	RoomMember.find({room: message.room})
		.populate('user')
		.then(roomMembers => roomMembers)
		.each(roomMember => {
			const regex = new RegExp(roomMember.user.nick + '\\b|@[Aa]ll', 'i');
			if (!regex.test(message.text)) return;

			return InboxMessage.create({user: roomMember.user._id, message: message._id})
				.then(inboxMessage => InboxMessage.findOne(inboxMessage._id)
					.populate('message', 'text createdAt room'))
				.then(inboxMessage => {
					inboxMessage.message.author = message.author;

					socketio.io.to('inboxmessage_' + roomMember.user._id)
						.emit('inboxmessage', {
							_id: message.author._id,
							verb: 'messaged',
							data: inboxMessage
						});
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
	})
		.then(broadcastMessage)
}

function image(roomMember, text) {
	const match = /^\/image(?:pick|search)*\s+(.*)$/i.exec(text);
	const searchQuery = ent.decode(match[1]);

	return imageSearch.image(searchQuery)
		.then(result => {
			socketio.io.to('userself_' + roomMember.user._id)
				.emit('user', {
					_id: roomMember.user._id,
					verb: 'messaged',
					data: {
						type: 'pick',
						message: `[${result.provider} image "${searchQuery}"] `,
						data: result.images
					}
				});
		});
}

function gif(roomMember, text) {
	const match = /^\/gif(?:pick|search)*\s+(.*)$/i.exec(text);
	const searchQuery = ent.decode(match[1]);

	return imageSearch.gif(searchQuery)
		.then(result => {
			socketio.io.to('userself_' + roomMember.user._id)
				.emit('user', {
					_id: roomMember.user._id,
					verb: 'messaged',
					data: {
						type: 'pick',
						message: `[${result.provider} gif "${searchQuery}"] `,
						data: result.images
					}
				});
		});
}

function fight(roomMember, text) {
	return fightService.play(roomMember, text)
		.then(function (fightResponse) {
			if (fightResponse.isList) {
				return RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, fightResponse.message, 'fight');
			}
			else {
				return message(roomMember, fightResponse.message, 'fight')
				//.then(function (message) {
				//	return saveFightInMentionedInboxes(message, roomMember.user, roomMember.room);
				//});
			}
		});
}

function hangman(roomMember, text) {
	return hangmanService.play(roomMember, text)
		.then(function (hangmanResponse) {
			if (hangmanResponse.isPrivate) {
				return RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, hangmanResponse.message, 'hangman');
			}

			return message(roomMember, hangmanResponse.message, 'hangman');
		});
}

function changeUserRole(roomMember, text) {
	if (roomMember.role !== 'administrator') throw new ForbiddenError('Must be an administrator to change to promote');

	var newRole;
	const user = roomMember.user;
	const roomId = roomMember.room;

	const match = /^\/(promote|demote)\s+([\w\s\-\.]{0,19})/i.exec(text);
	const action = match[1];
	const userNick = match[2];

	if (user.nick === userNick) throw new InvalidInputError('You cannot promote or demote yourself');

	return RoomService.getRoomMemberByNickAndRoom(userNick, roomId)
		.then(function (roomMemberToPromote) {
			if (!roomMemberToPromote) throw new InvalidInputError('Could not find user ' + userNick);

			if (action === 'promote') {
				newRole = roomMemberToPromote.role === 'member' ? 'moderator' : 'administrator';
			}
			else { // demote
				newRole = roomMemberToPromote.role === 'administrator' ? 'moderator' : 'member';
			}

			return RoomMember.findByIdAndUpdate(roomMemberToPromote._id, {role: newRole}, {new: true});
		})
		.then(function (promotedMember) {

			socketio.io.to('roommember_' + promotedMember._id)
				.emit('roommember', {
					_id: promotedMember._id,
					verb: 'updated',
					data: {role: newRole}
				});

			const message = roomMember.user.nick + ' has changed ' + userNick + ' to ' + newRole;
			RoomService.messageRoom(roomId, message);
		});
}

function leaderboard(roomMember, text) {
	const match = /^\/leaderboard\s+\-losers.*$/ig.exec(text);

	if (match) {
		return leaderboardService.getLoserboard()
			.then(function (loserboard) {
				return Message.create({
					room: roomMember.room,
					type: 'stats',
					author: roomMember.user,
					text: loserboard
				})
					.then(broadcastMessage);
			})
	}

	return leaderboardService.getLeaderboard()
		.then(function (leaderboard) {
			return Message.create({
				room: roomMember.room,
				type: 'stats',
				author: roomMember.user,
				text: leaderboard
			})
				.then(broadcastMessage);
		})
}

function setInfo(roomMember, text) {
	const infoMatch = text.match(/\/setinfo\s+(.+)/i);
	const info = infoMatch[1].substring(0, 50);
	const user = roomMember.user;

	return Promise.join(
		User.findByIdAndUpdate(user._id, {description: info}, {new: true}),
		RoomMember.find({user: user._id})
	)
		.spread(function (updatedUser, memberships) {
			socketio.io.to('user_' + updatedUser._id)
				.emit('user', {
					_id: updatedUser._id,
					verb: 'updated',
					data: {description: updatedUser.description}
				});
			RoomService.messageRooms(_.map(memberships, 'room'), updatedUser.nick + ' updated their whois info');
		});
}

function whois(roomMember, text) {
	const nickMatches = text.match(/^\/whois\s+([\w\s\-\.]{0,19})/i);
	const userNick = nickMatches[1];
	const roomId = roomMember.room;

	return RoomService.getRoomMemberByNickAndRoom(userNick, roomId)
		.then(function (whoisUser) {
			if (!whoisUser) throw new InvalidInputError('Could not find user ' + userNick);
			const userEmail = whoisUser.user.email;
			const userDescription = whoisUser.user.description;
			var message = "Whois " + whoisUser.user.nick + ": " + userEmail + " -- ";

			if (!userDescription) {
				message += "User has not set their info";
			} else {
				message += userDescription;
			}


			if (userEmail === "peter.brejcha@gmail.com") {
				message += " :petesux:";
			} else if (userEmail === "jprodahl@gmail.com") {
				message += " :joshsux:";
			} else if (userEmail === "polaris878@gmail.com") {
				message += " :drewsux:";
			} else if (userEmail === "alexandergmann@gmail.com") {
				message += " :glensux:";
			}

			RoomService.messageRoom(roomId, message);
		});
}

function poll(roomMember, text) {
	const roomId = roomMember.room;
	return pollService.start(roomMember, text)
		.then(function (pollResponse) {
			if (pollResponse.isPrivate) {
				RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
			} else {
				RoomService.messageRoom(roomId, pollResponse.message);
			}
		});
}

function pollClose(roomMember, text) {
	const roomId = roomMember.room;
	return pollService.close(roomMember, text)
		.then(function (pollResponse) {
			if (pollResponse.isPrivate) {
				RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
			} else {
				RoomService.messageRoom(roomId, pollResponse.message);
			}
		});
}

// voting is always private
function vote(roomMember, text) {
	const roomId = roomMember.room;
	return pollService.vote(roomMember, text)
		.then(function (pollResponse) {
			RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
		});
}


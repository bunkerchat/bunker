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

const ForbiddenError = require('../errors/ForbiddenError');
const InvalidInputError = require('../errors/InvalidInputError');
const ValidationError = require('mongoose').Error.ValidationError;

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
		return setRoomAttribute(roomMember, text);
	}
	else if (/^\/magic8ball/i.test(text)) {
		return magic8ball(roomMember, text); // Jordan's Magic 8 Ball, Bitches
	}
	else if (/^\/trump/i.test(text)) {
		return trump(roomMember);
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

	const emoticonMatches = /\/show\s+:?(\w+):?/.exec(text);
	if (!emoticonMatches || emoticonMatches.length < 1) {
		throw new InvalidInputError('Invalid show format — example: /show doge');
	}

	const emoticon = emoticonMatches[1];

	var words = [];
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

	RoomService.animateInRoom(roomMember, emoticon, _.sampleSize(words, 10));
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

function setRoomAttribute(roomMember, text) {

	if (roomMember.role === 'member') throw new ForbiddenError('Must be an administrator or moderator to change room attributes');

	const user = roomMember.user;
	const matches = text.match(/\/(\w+)\s*(.*)/i);
	const commands = ['name', 'topic', 'privacy', 'icon'];
	const command = matches[1].toLowerCase();

	if (!matches || _.intersection(commands, [command]).length === 0) {
		throw new InvalidInputError(`Invalid room command — options are ${commands.join(', ')}`);
	}

	return Room.findById(roomMember.room)
		.then(room => {
			var message;

			if (command === 'topic') {
				const topic = matches[2].substr(0, 200).trim();
				room.topic = topic;

				if (topic && topic.length > 0) {
					message = `${user.nick} changed the topic to ${topic}`;
				}
				else {
					message = `${user.nick} cleared the topic`;
				}
			}
			if (command === 'name') {
				if (roomMember.role !== 'administrator') throw new ForbiddenError('Must be an administrator to change room name');

				const name = matches[2].substr(0, 50).trim();
				room.name = name;
				message = `${user.nick} changed the room name to ${name}`;
			}
			else if (command === 'privacy') {
				if (roomMember.role !== 'administrator') throw new ForbiddenError('Must be an administrator to change room privacy');

				const privacy = matches[2].toLowerCase().trim();
				if (privacy !== 'public' && privacy !== 'private') {
					throw new InvalidInputError('Invalid privacy — options are public, private');
				}

				room.isPrivate = privacy === 'private';
				message = `${user.nick} changed the room to ${room.isPrivate ? 'private' : 'public'}`;
			}
			else if (command === 'icon') {
				if (roomMember.role !== 'administrator') throw new ForbiddenError('Must be an administrator to change room icon');

				var icon = matches[2].toLowerCase().trim();
				if (!icon || icon.length === 0) {
					room.icon = null;
					message = `${user.nick} cleared the room icon`;
				}
				else {
					if (!icon.startsWith(':fa-')) throw new InvalidInputError('Invalid icon — use Font Awesome icons (they start with :fa-)');
					icon = icon.replace(/:|fa-/g, '');
					room.icon = icon;
					message = `${user.nick} changed the room icon to :fa-${icon}:`;
				}
			}

			return Promise.join(room.save(), message);
		})
		.spread((room, message) => {
			socketio.io.to('room_' + room._id)
				.emit('room', {
					_id: room._id,
					verb: 'updated',
					data: room
				});
			RoomService.messageRoom(room._id, message);
		})
		.catch(ValidationError, err => {
			const message = _.sample(err.errors).message;
			throw new InvalidInputError(`Invalid room ${command} input — ${message}`);
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


function trump(roomMember) {
	const response = _.sample([
		`Any negative polls are fake news, just like the CNN, ABC, NBC polls in the election.`,
		`An ‘extremely credible source’ has called my office and told me that Barack Obama’s birth certificate is a fraud.`,
		`I will build a great wall – and nobody builds walls better than me, believe me.`,
		`They’re rapists… And some, I assume, are good people.`,
		`All of the women on The Apprentice flirted with me – consciously or unconsciously. That’s to be expected.`,
		`The beauty of me is that I’m very rich.`,
		`It’s freezing and snowing in New York – we need global warming!`,
		`I’ve said if Ivanka weren’t my daughter, perhaps I’d be dating her.`,
		`My fingers are long and beautiful, as, it has been well documented, are various other parts of my body.`,
		`The point is, you can never be too greedy.`,
		`My IQ is one of the highest — and you all know it! Please don’t feel so stupid or insecure; it’s not your fault.`,
		`Look at those hands, are they small hands?`,
		`Number one, I have great respect for women. I was the one that really broke the glass ceiling on behalf of women.`,
		`I’m just thinking to myself right now, we should just cancel the election and just give it to Trump, right?`,
		`I thought being President would be easier than my old life.`,
		`And when you’re a star, they let you do it. You can do anything. Grab them by the pussy. You can do anything.`,
		`40 Wall Street actually was the second-tallest building in downtown Manhattan… And now it’s the tallest.`,
		`Why can’t we use nuclear weapons?`,
		`I think I am actually humble. I think I’m much more humble than you would understand.`,
		`Fake news is at an all time high.`,
		`I know more about ISIS than the generals do. Believe me.`,
		`I will be the greatest jobs president that God ever created. I tell you that.`,
		`I will build a great great wall on our southern border. And I will have Mexico pay for that wall.`,
		`I don’t have a racist bone in my body.`,
		`Jeb Bush has to like the Mexican Illegals because of his wife.`,
		`The truth is we wouldn’t be talking about illegal immigration if it weren’t for me.`,
		`I’m talking about Mexico is forcing people in that they don’t want and they want us to take care of those people.`,
		`He’s a war hero because he was captured. I like people that weren’t captured OK?`,
		`I think I’d get along very well with Vladimir Putin. I just think so. People say ‘What do you mean?’ I think I would get along well with him.`,
		`You could see there was blood coming out of her eyes blood coming out of her wherever.`,
		`I cherish women. I want to help women. I’m going to be able to do things for women that no other candidate would be able to do.`,
		`I’m leading in the Hispanic vote and I’m going to win the Hispanic vote. I’m also leading in the regular vote.`,
		`Heidi Klum... sadly she’s no longer a 10.`,
		`I have a plan but … If I win I don’t want to broadcast to the enemy exactly what my plan is.`,
		`Look at that face! Would anyone vote for that? Can you imagine that the face of our next president?!`,
		`I never attacked him on his looks and believe me there’s a lot of subject matter there.`,
		`I have a great temperament. My temperament is very good, very calm.`,
		`Everything I’ve done virtually has been a tremendous success.`,
		`I believe in clean air. Immaculate air. … But I don’t believe in climate change.`,
		`It’s really cold outside they are calling it a major freeze weeks ahead of normal. Man we could use a big fat dose of global warming!`,
		`I’ve done it four times out of hundreds and I’m glad I did it. I used the laws of the country to my benefit. I’m sorry.`,
		`I know more about ISIS than the generals do. Believe me.`,
		`How stupid are the people of Iowa? How stupid are the people of the country to believe this crap?`,
		`When he said he stabbed somebody with a knife but it hit a belt buckle—I know all about knives and belt buckles.`,
		`Obama said in his speech that Muslims are our sports heroes. What sport is he talking about and who? Is Obama profiling?`,
		`He’s running his country and at least he’s a leader. You know unlike what we have in this country.`,
		`I know where she went it’s disgusting I don’t want to talk about it. No it’s too disgusting.`,
		`Does everyone see that the Democrats and President Obama are now because of me starting to deport people who are here illegally. Politics!`,
		`I could stand in the middle of Fifth Avenue and shoot somebody and I wouldn’t lose voters.`,
		`I refuse to call Megyn Kelly a bimbo because that would not be politically correct. Instead I will only call her a lightweight reporter!`,
		`I would bring back waterboarding. And I’d bring back a hell of a lot worse than waterboarding.`,
		`Wow Jeb Bush whose campaign is a total disaster had to bring in mommy to take a slap at me. Not nice!`,
		`Putin called me a genius I like him so far I have to tell you.`,
		`Don’t tell me it doesn’t work—torture works. Half these guys say: ‘Torture doesn’t work.’ Believe me it works.`,
		`I wonder if President Obama would have attended the funeral of Justice Scalia if it were held in a Mosque? Very sad that he did not go!`,
		`I’m speaking with myself number one because I have a very good brain and I’ve said a lot of things.`,
		`Do I look a president? How handsome am I right? How handsome?`,
		`We can’t continue to allow China to rape our country and that’s what they’re doing.`,
		`I think the only card she has is the woman’s card. She’s got nothing else going.`,
		`His father was with Lee Harvey Oswald prior to Oswald’s being—you know shot. I mean the whole thing is ridiculous.`,
		`Happy #CincoDeMayo! The best taco bowls are made in Trump Tower Grill. I love Hispanics!`,
		`First of all you never have to default because you print the money I hate to tell you OK? So there’s never a default.`,
		`I’m the king of debt. I understand debt better than probably anybody. I know how to deal with debt so well. I love debt.`,
		`The pathetic new hit ad against me misrepresents the final line. “You can tell them to go BLANK themselves”, - was about China NOT WOMEN!`,
		`I would speak to him I would have no problem speaking to him`,
		`I will give you everything. … I’m the only one.`,
		`I don’t talk about his alcoholism so why would he talk about my foolishly perceived fascism?`,
		`I thought this would be like Dr. Martin Luther King where the people would be lined up from here all the way to the Washington Monument.`,
		`You’re a sleaze.`,
		`Look at my African-American here!`,
		`Many of the thugs that attacked the peaceful Trump supporters in San Jose were illegals. They burned the American flag and laughed at police.`,
		`And by the way just so you know I am the least racist person the least racist person that you’ve ever seen the least.`,
		`Appreciate the congrats for being right on radical Islamic terrorism I don’t want congrats I want toughness & vigilance. We must be smart!`,
		`They’re trying to take over our children. ...They’re pouring in and we don’t know what we’re doing.`,
		`I feel like a supermodel except like times 10 OK? It’s true. I’m a supermodel.`,
		`I think profiling is something that we’re going to have to start thinking about as a country.`,
		`I don’t think anybody should listen to me because I haven’t really focused on it very much.`,
		`Just arrived in Scotland. People are going wild over the vote. They took their country back. Just like we’ll take our country back. No games.`,
		`When the pound goes down more people are coming to Turnberry frankly.`,
		`That could be a Mexican plane up there. They’re getting ready to attack`,
		`Most corrupt candidate ever!`,
		`Where is the outrage for this Disney book? Is this the ‘Star of David’ also? Dishonest media! #Frozen`,
		`One of the reasons is party unity I have to be honest.`,
		`Good news is Melania’s speech got more publicity than any in the history of politics especially if you believe that all press is good press!`,
		`I alone can fix it.`,
		`Crazy Bernie is going crazy right now OK?`,
		`Pocahontas bombed last night! Sad to watch`,
		`Russia if you’re listening I hope you’re able to find the 30000 emails that are missing. I think you will probably be rewarded mightily by our press.`,
		`The people of Crimea from what I’ve heard would rather be with Russia than where they were.`,
		`I’m afraid the election’s going to be rigged I have to be honest.`,
		`I always wanted to get the Purple Heart. This was much easier.`,
		`Many people are saying that the Iranians killed the scientist who helped the U.S. because of Hillary Clinton’s hacked emails.`,
		`They will soon be calling me MR. BREXIT!`,
		`Hillary Clinton is a bigot who sees people of color only as votes not as human beings worthy of a better future.`,
		`Mexico will pay for the wall!`,
		`I think people don’t care about my tax returns. I don’t think anybody cares except some members of the press.`,
		`I’ll answer that question at the right time. I just don’t want to answer it yet.`,
		`Do people notice Hillary is copying my airplane rallies—she puts the plane behind her like I have been doing from the beginning.`,
		`Hillary Clinton is taking the day off again she needs the rest. Sleep well Hillary—see you at the debate!`,
		`Our African-American communities are absolutely in the worst shape they’ve ever been in before. Ever. Ever. Ever.`,
		`He’s a fantastic guy. … He took control of Egypt. And he really took control of it.`,
		`Just go to her website. She tells you how to fight ISIS on her website. I don’t think General Douglas MacArthur would like that too much.`,
		`Every on-line poll Time Magazine Drudge etc. has me winning the debate. Thank you to Fox & Friends for so reporting!`,
		`For those few people knocking me for tweeting at three o’clock in the morning at least you know I will be there awake to answer the call!`,
		`We have an increase in murder within our cities the biggest in 45 years.`,
		`Take a look. Look at her. Look at her words. And you tell me what you think. I don’t think so.`,
		`Hillary Clinton should have been prosecuted and should be in jail. Instead she is running for president in what looks like a rigged election`,
		`I think we should take a drug test prior to the debate.`,
		`Hillary is the most corrupt person to ever run for the presidency of the United States. #DrainTheSwamp`,
		`Such a nasty woman.`,
		`I will totally accept the results of this great and historic presidential election—if I win.`,
		`The results are in on the final debate and it is almost unanimous I WON! Thank you these are very exciting times.`,
		`All of these liars will be sued after the election is over.`,
		`A lot of call-ins about vote flipping at the voting booths in Texas. People are not happy. BIG lines. What is going on?`,
		`We’ve got to be nice and cool nice and calm. All right stay on point Donald. Stay on point. No sidetracks Donald. Nice and easy.`
	]);

	setTimeout(function () {
		return Message.create({
			room: roomMember.room,
			author: null,
			type: '8ball',
			text: `:trump: ${response}`
		})
			.then(broadcastMessage);
	}, 3000);

	const question = ' asks Trump what he thinks on this topic';
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


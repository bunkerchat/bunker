const RoomService = module.exports;

const uuid = require('node-uuid');
const User = require('../models/User');
const Room = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const socketio = require('../config/socketio');

const InvalidInputError = require('../errors/InvalidInputError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('mongoose').Error.ValidationError;

RoomService.messageRoom = function (room, messageText) {
	const roomId = room._id ? room._id : room;
	socketio.io.to('room_' + roomId).emit('room', {
		_id: roomId, verb: 'messaged', data: {
			_id: uuid.v4(),
			type: 'room',
			text: messageText,
			room: roomId,
			createdAt: new Date().toISOString()
		}
	});
};

RoomService.animateInRoom = function (roomMember, emoticon, words) {
	const room = roomMember.room;
	const user = roomMember.user;
	const roomId = room._id ? room._id : room;

	socketio.io.to('room_' + roomId).emit('room', {
		_id: roomId, verb: 'messaged', data: {
			_id: uuid.v4(),
			type: 'animation',
			room: roomId,
			user,
			words,
			emoticon,
			text: user.nick + ' shows the room ' + emoticon,
			createdAt: new Date().toISOString()
		}
	});
};

RoomService.messageRooms = function (rooms, message) {
	_.each(rooms, function (room) {
		RoomService.messageRoom(room, message);
	});
};

RoomService.messageRoomsWithUser = function (spec) {

	const query = {user: spec.userId};
	if (spec.roomId) {
		query.room = spec.roomId;
	}

	RoomMember.find().where(query).populate('room').exec(function (error, roomMembers) {
		if (error) return false;
		if (!roomMembers) return true;

		_(roomMembers).map('room').each(function (room) {
			if (!room) return;
			// If we were provided a message, send it down to affected rooms
			if (spec.systemMessage) {
				Room.message(room._id, {
					_id: uuid.v4(),
					type: 'room',
					text: spec.systemMessage,
					room: room._id,
					createdAt: new Date().toISOString()
				});
			}
		});

		return true;
	});
};

RoomService.messageUserInRoom = function (userId, roomId, messageText, type) {
	return RoomMember.findOne({room: roomId, user: userId})
		.populate('user room')
		.then(function (roomMember) {
			socketio.io.to('userself_' + roomMember.user._id)
				.emit('roommember', {
					_id: roomMember._id, verb: 'messaged', data: {
						_id: uuid.v4(),
						text: messageText,
						type: type,
						room: roomMember.room,
						user: roomMember.user,
						createdAt: new Date().toISOString()
					}
				});
		});
};

RoomService.getRoomMemberByNickAndRoom = function (userNick, roomId) {
	return User.find({nick: userNick}).then(function (users) {

		if (users.length == 0) {
			return null;
		}

		const userIds = users.map(function (user) {
			return user._id;
		});

		return RoomMember.findOne({user: userIds, room: roomId}).populate('user room');
	});
};

RoomService.setRoomAttribute = (roomMember, text)  => {
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
			let message;

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

				let icon = matches[2].toLowerCase().trim();
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

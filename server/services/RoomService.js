var uuid = require('node-uuid');

var Room = require('../models/Room');
var RoomMember = require('../models/RoomMember');
var socketio = require('../config/socketio');

var RoomService = module.exports;

RoomService.messageRoom = function (room, message) {
	var roomId = room._id ? room._id : room;

	var joinMessage = {
		_id: uuid.v4(),
		type: 'room',
		text: message,
		room: roomId,
		createdAt: new Date().toISOString()
	};

	socketio.io.to('room_' + roomId).emit('room', {_id: roomId, verb: 'messaged', data: joinMessage});
};

RoomService.animateInRoom = function (roomMember, emoticon, words) {
	var room = roomMember.room;
	var user = roomMember.user;
	var roomId = room._id ? room._id : room;
	Room.message(roomId, {
		id: uuid.v4(),
		type: 'animation',
		room: roomId,
		user: user,
		words: words,
		emoticon: emoticon,
		text: user.nick + ' shows the room ' + emoticon,
		createdAt: new Date().toISOString()
	});
};

RoomService.messageRooms = function (rooms, message) {
	_.each(rooms, function (room) {
		RoomService.messageRoom(room, message);
	});
};

RoomService.messageRoomsWithUser = function (spec) {

	var query = {user: spec.userId};
	if (spec.roomId) {
		query.room = spec.roomId;
	}

	RoomMember.find().where(query).populate('room').exec(function (error, roomMembers) {
		if (error) return false;
		if (!roomMembers) return true;

		_(roomMembers).pluck('room').each(function (room) {
			if (!room) return;
			// If we were provided a message, send it down to affected rooms
			if (spec.systemMessage) {
				Room.message(room._id, {
					id: uuid.v4(),
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
	return RoomMember.findOne({room: roomId, user: userId}).populate('user room').then(function (roomMember) {
		socketio.io.to('roommember_' + roomMember._id).emit('roommember', {
			_id: roomMember._id, verb: 'messaged', data: {
				id: uuid.v4(),
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

		var userIds = users.map(function (user) {
			return user._id;
		});

		return RoomMember.findOne({user: userIds, room: roomId}).populateAll();
	});
};



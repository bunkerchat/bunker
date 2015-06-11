var uuid = require('node-uuid');

module.exports.messageRoom = function (room, message) {
	var roomId = room.id ? room.id : room;
	Room.message(roomId, {
		id: uuid.v4(),
		type: 'room',
		text: message,
		room: roomId,
		createdAt: new Date().toISOString()
	});
};

module.exports.animateInRoom = function (roomMember, emoticon, words) {
	var room = roomMember.room;
	var user = roomMember.user;
	var roomId = room.id ? room.id : room;
	Room.message(roomId, {
		id: uuid.v4(),
		type: 'animation',
		room: roomId,
		author: user,
		words: words,
		emoticon: emoticon,
		text: emoticon,
		createdAt: new Date().toISOString()
	});
};

module.exports.messageRooms = function (rooms, message) {
	_.each(rooms, function (room) {
		module.exports.messageRoom(room, message);
	});
};

module.exports.messageRoomsWithUser = function (spec) {

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
				Room.message(room.id, {
					id: uuid.v4(),
					type: 'room',
					text: spec.systemMessage,
					room: room.id,
					createdAt: new Date().toISOString()
				});
			}
		});

		return true;
	});
};

module.exports.messageUserInRoom = function (userId, roomId, message, type) {
	return RoomMember.findOne({room: roomId, user: userId}).populateAll().then(function (roomMember) {
		return RoomMember.message(roomMember.id, {
			id: uuid.v4(),
			text: message,
			type: type,
			room: roomMember.room,
			user: roomMember.user,
			createdAt: new Date().toISOString()
		});
	});
};

var uuid = require('node-uuid');
var serverWarmup = require('./serverWarmup');

module.exports.messageRoom = function (room, message) {
	if (!serverWarmup.done) return;

	var roomId = room.id ? room.id : room;
	Room.message(roomId, {
		id: uuid.v4(),
		text: message,
		room: roomId,
		createdAt: new Date().toISOString()
	});
};

module.exports.messageRooms = function (rooms, message) {
	if (!serverWarmup.done) return;

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
			// If we were provided a message, send it down to affected rooms
			if (spec.systemMessage && serverWarmup.done) {
				Room.message(room.id, {
					id: uuid.v4(),
					text: spec.systemMessage,
					room: room.id,
					createdAt: new Date().toISOString()
				});
			}
		});

		return true;
	});
};

module.exports.messageUserInRoom = function(userId, roomId, message){
	RoomMember.findOne({room: roomId, user: userId}).populateAll().exec(function(error, roomMember){
		RoomMember.message(roomMember.id, {
			id: uuid.v4(),
			text: message,
			room: roomMember.room,
			user: roomMember.user,
			createdAt: new Date().toISOString()
		});
	});
};

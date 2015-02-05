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

module.exports.messageRoomsWithUser = function (userId, systemMessage) {
	RoomMember.find().where({user: userId}).populate('room').exec(function (error, roomMembers) {
		if (error) return false;
		if (!roomMembers) return true;

		_(roomMembers).pluck('room').each(function (room) {
			// If we were provided a message, send it down to affected rooms
			if (systemMessage && serverWarmup.done) {
				Room.message(room.id, {
					id: uuid.v4(),
					text: systemMessage,
					room: room.id,
					createdAt: new Date().toISOString()
				});
			}
		});

		return true;
	});
};

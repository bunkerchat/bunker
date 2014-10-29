
var uuid = require('node-uuid');

module.exports.updateAllWithUser = function(userId, systemMessage) {
	Room.find().populate('members').exec(function (error, rooms) {
		if (error) return false;
		_.each(rooms, function (room) {
			if (_.any(room.members, {id: userId})) {
				Room.publishUpdate(room.id, room);

				// If we were provided a message, send it down to affected rooms
				if(systemMessage) {
					Room.message(room.id, {
						id: uuid.v4(),
						text: systemMessage,
						room: room.id,
						createdAt: new Date().toISOString()
					});
				}
			}
		});
		return true;
	});
};

module.exports.messageRooms = function(rooms, message) {
	_.each(rooms, function(room) {
		var roomId = room.id ? room.id : room;

		Room.message(roomId, {
			id: uuid.v4(),
			text: message,
			room: roomId,
			createdAt: new Date().toISOString()
		});
	});
};

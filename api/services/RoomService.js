
module.exports.updateAllWithUser = function(userId) {
	Room.find().populate('members').exec(function (error, rooms) {
		if (error) return false;
		_.each(rooms, function (room) {
			if (_.any(room.members, {id: userId})) {
				Room.publishUpdate(room.id, room);
			}
		});
		return true;
	});
};
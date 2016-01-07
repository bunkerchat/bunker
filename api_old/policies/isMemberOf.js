module.exports = function (req, res, next) {
	var roomId = req.param('roomId') || req.param('id');
	Room.findOne(roomId).populateAll().exec(function (error, room) {
		if (_.any(room.members, {_id: req.session.userId})) { // Make sure user is a member
			return next();
		}
		res.forbidden();
	});
};

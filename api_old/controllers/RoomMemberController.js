var Promise = require('bluebird');

module.exports.updateSettings = function (req, res) {
	Promise.each(req.body.roomMembers, function (roomMember) {
		return RoomMember.findOne(roomMember._id)
			.then(function (dbRoomMember) {
				// verify only changing users own roomMembers
				if(dbRoomMember.user != req.session.userId) return;

				var values = _.pick(roomMember, 'roomOrder', 'playSoundOnMessage', 'showMessageDesktopNotification');
				return RoomMember.update(roomMember._id, values);
			})
	})
		.then(res.ok)
		.catch(res.serverError);
};

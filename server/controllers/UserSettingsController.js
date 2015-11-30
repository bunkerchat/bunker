var UserSettings = require('../models/UserSettings');
var RoomMember = require('../models/RoomMember');

module.exports.save = function (req, res) {
	var id = req.body.userSettingsId.toObjectId();
	var update = req.body.settings;

	UserSettings.findByIdAndUpdate(id, update)
		.then(res.ok)
		.catch(res.serverError);
};

module.exports.saveRoomMember = function (req, res) {
	Promise.each(req.body.roomMembers, function (roomMember) {
		return RoomMember.findByIdAndUpdate(roomMember._id.toObjectId(), roomMember);
	})
		.then(res.ok)
		.catch(res.serverError);
};

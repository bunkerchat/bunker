//var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

var Promise = require('bluebird');

module.exports.updateSettings = function (req, res) {
	Promise.each(req.body.roomMembers, function (roomMember) {
		var values = _.pick(roomMember, 'roomOrder', 'playSoundOnMessage', 'showMessageDesktopNotification');
		return RoomMember.update(roomMember.id, values);
	})
		.then(res.ok)
		.catch(res.serverError);
};
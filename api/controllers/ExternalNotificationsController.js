var lastStatus;

module.exports.jenkinsBestBuy = function (req, res) {

	var notification = req.body;
	var build = notification.build;

	if (build.full_url.indexOf('bestbuy.com') == 0) return res.ok('welp');

	// only show completed builds
	if (build.phase != 'COMPLETED') return res.ok('thanks');

	// don't show successful builds if the last build was a success
	if(lastStatus == 'SUCCESS' && build.status == 'SUCCESS') return res.ok('thanks2');

	lastStatus = build.status;

	var roomId;
	var emote = build.status == 'FAILURE' ? ' :buildchicken:' : ':unsmith:';
	var url = build.full_url + "console";
	var text = emote + ' Build Notification: { name: "' + notification.name + '" , status: "' + build.status + '", link: ' + url + ' };';

	Room.findOne({name: 'minos'})
		.then(function (room) {
			roomId = room.id;
			return Message.create({
				room: room.id,
				text: text,
				type: 'buildNotification'
			})
		})
		.then(function (message) {
			return Message.findOne(message.id).populateAll();
		})
		.then(function (message) {
			Room.message(roomId, message);
			return message;
		})
		.then(res.ok)
		.catch(res.serverError);
};

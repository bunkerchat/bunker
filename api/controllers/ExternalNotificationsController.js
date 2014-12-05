module.exports.jenkinsBestBuy = function (req, res) {

	var notification = req.body;
	var build = notification.build;

	if (build.full_url.indexOf('bestbuy.com') == 0) return res.ok('welp');
	if (build.phase != 'COMPLETED') return res.ok('thanks');

	var roomId;
	var chicken = build.status == 'FAILURE' ? ' :buildchicken:' : '';
	var url = build.full_url + "/console";
	var text = 'Build Notification: ' + notification.name + ' | Status: ' + build.status + chicken + ' | ' + url;

	Room.findOne({name: 'BestBuy'})
		.then(function (room) {
			roomId = room.id;
			return Message.create({
				room: room.id,
				text: text
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

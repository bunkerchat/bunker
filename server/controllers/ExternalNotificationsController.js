var Promise = require("bluebird");
var Room = require("../models/Room");
var ExternalNotifications = require("../models/ExternalNotifications");
var Message = require("../models/Message");
var messageService = require("../services/messageService");

module.exports.jenkinsBestBuy = function(req, res) {
	var notification = req.body;
	var build = notification.build;
	var roomId;

	// new jenkins isn't passing full_url anymore :-(
	if (build.full_url.indexOf("bestbuy.com") == 0) return res.ok("welp");
	//var full_url = "http://minos-ops.na.bestbuy.com:8080/" + build.url;

	// only show completed builds
	if (build.phase != "COMPLETED") return res.ok("thanks");

	Promise.join(Room.findOne({ name: "minos" }), ExternalNotifications.findOne({ type: notification.name }))
		.spread(function(room, externalNotification) {
			roomId = room._id;
			return externalNotification || ExternalNotifications.create({ type: notification.name });
		})
		.then(function(externalNotification) {
			// don't show successful builds if the last build was a success
			if (externalNotification.lastStatus == "SUCCESS" && build.status == "SUCCESS") return res.ok("thanks2");
			externalNotification.lastStatus = build.status;

			return externalNotification
				.save()
				.then(function() {
					var emote = build.status == "FAILURE" ? " :buildchicken:" : ":unsmith:";
					var url = build.full_url + "console";
					var protractorUrl = build.full_url + "artifact/e2e_screenshots/my-report.html";
					var text =
						emote +
						' Build Notification: { name: "' +
						notification.name +
						'" , status: "' +
						build.status +
						'" , link: ' +
						url +
						" , protractorReport: " +
						protractorUrl +
						" };";

					return Message.create({
						room: roomId,
						text: text,
						type: "buildNotification"
					});
				})
				.then(messageService.broadcastMessage)
				.then(res.ok)
				.catch(res.serverError);
		});
};

module.exports.serverStatus = function(req, res) {
	var notification = req.body;

	Room.findOne({ name: "minos" })
		.then(function(room) {
			return Message.create({
				room: room._id,
				text: "Uptime Check Notification. Down: " + _.map(req.body.down, "url").join(" "),
				type: "buildNotification"
			});
		})
		.then(messageService.broadcastMessage)
		.then(res.ok)
		.catch(res.serverError);
};

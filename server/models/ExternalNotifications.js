var mongoose = require('mongoose');

var externalNotificationsSchema = new mongoose.Schema({
	type: String,
	lastStatus: String
});

module.exports = mongoose.model('ExternalNotifications', externalNotificationsSchema, 'externalnotifications');

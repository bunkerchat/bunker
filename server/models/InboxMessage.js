var mongoose = require('mongoose');

var inboxMessageSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	message: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	},
	read: {
		type: Boolean,
		defaults: false
	}
});

module.exports = mongoose.model('InboxMessage', inboxMessageSchema, 'inboxmessage');
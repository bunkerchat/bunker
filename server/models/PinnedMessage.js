var mongoose = require('mongoose');

var pinnedMessageSchema = new mongoose.Schema({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	},
	message: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	},
});

module.exports = mongoose.model('PinnedMessage', pinnedMessageSchema, 'pinnedmessage');


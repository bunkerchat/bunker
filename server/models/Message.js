var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	createdAt:{
		type: Date,
		default: Date.now
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	type: {
		type: String,
		enum: [
			'standard',
			'emote',
			'room',
			'global',
			'help',
			'roll',
			'8ball',
			'animation',
			'buildNotification',
			'hangman',
			'fight',
			'code',
			'stats'
		],
		default: 'standard'
	},
	text: {
		type: String,
		required: true,
		minlength: 1
	},
	edited: {
		type: Boolean,
		default: false
	},
	editCount: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Message', messageSchema, 'message');

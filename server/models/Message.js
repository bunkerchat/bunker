const mongoose = require('mongoose');
const Reaction = require('./Reaction');

const messageSchema = new mongoose.Schema({
	createdAt: {
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
			'trump',
			'animation',
			'buildNotification',
			'hangman',
			'fight',
			'code',
			'stats',
			'link'
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
	},
	linkMeta: {
		type: Object
	},
	reactions: [Reaction]
});

messageSchema.index({ text: 'text'});

module.exports = mongoose.model('Message', messageSchema, 'message');

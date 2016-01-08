var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	word: {
		type: String,
		required: true
	},
	misses: {
		type: Array,
		default: []
	},
	hits: {
		type: Array,
		default: []
	},
	isPrivate: Boolean,
	lastGuessSuccess: Boolean
});

module.exports = mongoose.model('HangmanGame', schema, 'hangmangame');

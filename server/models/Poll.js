var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room',
	},
	question: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	respondees: {
		type: Array,
		default: []
	},
	totalNumVotes: {
		type: Number,
		default: zero,
	},
	isOpen: {
		type: Boolean,
		default: true,
	},
});

module.exports = mongoose.model('Poll', schema, 'poll');

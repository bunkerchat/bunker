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
		default: 0,
	},
	isOpen: {
		type: Boolean,
		default: true,
	},
	options: {
		type: Array,
		default: [],
	},
	optionVotes: {
		type: Array,
		default: [],
	},
});

module.exports = mongoose.model('Poll', schema, 'poll');

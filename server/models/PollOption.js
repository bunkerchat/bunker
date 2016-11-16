var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	poll: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Poll',
	},
	optionString: {
		type: String,
		required: true,
	},
	optionNumber: {
		type: Number,
		default: zero,
	}
	numberOfVotes: {
		type: Number,
		required: true,
		default: zero,
	},
});

module.exports = mongoose.model('PollOption', schema, 'polloption');

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	privateGameWinCount: {
		type: Number,
		default: zero
	},
	privateGameLossCount: {
		type: Number,
		default: zero
	},
	guessMisses: {
		type: Number,
		default: zero
	},
	guessHits: {
		type: Number,
		default: zero
	}
});

module.exports = mongoose.model('HangmanUserStatistics', schema, 'hangmanuserstatistics');

function zero() {
	return 0;
}

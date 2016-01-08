var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	privateGameWinCount: {
		type: Number,
		defaults: zero
	},
	privateGameLossCount: {
		type: Number,
		defaults: zero
	},
	guessMisses: {
		type: Number,
		defaults: zero
	},
	guessHits: {
		type: Number,
		defaults: zero
	}
});

module.exports = mongoose.model('HangmanUserStatistics', schema, 'hangmanuserstatistics');

function zero() {
	return 0;
}

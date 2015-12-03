var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	privateGameWinCount: {
		type: Number,
		defaults: 0
	},
	privateGameLossCount: {
		type: Number,
		defaults: 0
	},
	guessMisses: {
		type: Number,
		defaults: 0
	},
	guessHits: {
		type: Number,
		defaults: 0
	}
});

module.exports = mongoose.model('HangmanUserStatistics', schema, 'hangmanUserStatistics');

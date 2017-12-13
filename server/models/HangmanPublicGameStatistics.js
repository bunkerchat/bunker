var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	winCount: {
		type: Number,
		default: zero
	},
	lossCount: {
		type: Number,
		default: zero
	}
});

module.exports = mongoose.model('HangmanPublicGameStatistics', schema, 'hangmanpublicgamestatistics');

// mongoose executes default functions on new models
function zero() {
	return 0;
}

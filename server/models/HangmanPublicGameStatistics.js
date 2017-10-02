var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	winCount: {
		type: Number,
		defaults: zero
	},
	lossCount: {
		type: Number,
		defaults: zero
	}
});

module.exports = mongoose.model('HangmanPublicGameStatistics', schema, 'hangmanpublicgamestatistics');

// mongoose executes default functions on new models
function zero() {
	return 0;
}

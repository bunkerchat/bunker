var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	winCount: {
		type: Number,
		defaults: 0
	},
	lossCount: {
		type: Number,
		defaults: 0
	}
});

module.exports = mongoose.model('HangmanPublicGameStatistics', schema, 'hangmanPublicGameStatistics');

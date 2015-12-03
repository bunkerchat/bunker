var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	fight: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Fight'
	},
	roundNumber: {
		type: Number,
		required: true
	},
	challengerPlay: {
		type: String,
		enum: ['h', 'm', 'l']
	},
	opponentPlay: {
		type: String,
		enum: ['h', 'm', 'l', ''],
		default: ''
	},
	winningUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model('FightRound', schema, 'fightRound');

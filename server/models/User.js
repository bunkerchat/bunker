var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	//token: {
	//	type: String,
	//	required: true
	//	//minLength: 20
	//},
	nick: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 20
	},
	email: {
		type: String
	},
	sockets: {
		type: Array,
		default: []
	},
	connected: {
		type: Boolean,
		default: false
	},
	lastConnected: {
		type: Date
	},
	present: {
		type: Boolean,
		default: true
	},
	busy: {
		type: Boolean,
		default: false
	},
	busyMessage: {
		type: String
	},
	typingIn: {
		type: String,
		defaultsTo: null
	},
	settings: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'UserSettings'
	},
	activeRoom: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	}
});

module.exports = mongoose.model('User', userSchema, 'user');

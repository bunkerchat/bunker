var mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 1
	},
	topic: {
		type: String,
		maxlength: 200
	},
	icon: {
		type: String
	},
	isPrivate: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('Room', roomSchema, 'room');

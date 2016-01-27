var mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 50
	},
	topic: {
		type: String,
		maxlength: 200
	},
	isPrivate: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('Room', roomSchema, 'room');

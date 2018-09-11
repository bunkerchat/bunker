const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room'
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	emoticonName: {
		type: String,
		required: true,
		minlength: 1
	}
});

module.exports = schema;

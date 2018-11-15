const mongoose = require("mongoose");

const Room = new mongoose.Schema({
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
	topicTokens: Array,
	icon: String,
	isPrivate: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model("Room", Room);

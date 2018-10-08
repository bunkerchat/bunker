var mongoose = require("mongoose");

var schema = new mongoose.Schema({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Room"
	},
	challenger: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	opponent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	winningUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	resultMessage: {
		type: String,
		default: ""
	}
});

module.exports = mongoose.model("Fight", schema, "fight");

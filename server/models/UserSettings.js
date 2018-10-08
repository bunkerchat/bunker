var mongoose = require("mongoose");

var userSettingsSchema = new mongoose.Schema({
	showImages: {
		type: Boolean,
		default: true
	},
	showNotifications: {
		type: Boolean,
		default: true
	},
	showEmoticons: {
		type: Boolean,
		default: true
	},
	showDebugging: {
		type: Boolean,
		default: false
	},
	bunkerServesImages: {
		type: Boolean,
		default: false
	},
	minimalView: {
		type: Boolean,
		default: false
	},
	sortEmoticonsByPopularity: {
		type: Boolean,
		default: false
	},
	playSoundOnMention: {
		type: Boolean,
		default: false
	},
	desktopMentionNotifications: {
		type: Boolean,
		default: false
	},
	multilineShiftEnter: {
		type: Boolean,
		default: false
	},
	theme: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

module.exports = mongoose.model("UserSettings", userSettingsSchema, "usersettings");

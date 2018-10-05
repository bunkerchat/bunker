const mongoose = require('mongoose');

const roomMemberSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room',
		index: true
	},
	role: {
		type: String,
		enum: ['member', 'moderator', 'administrator'],
		default: 'member'
	},
	roomOrder: {
		type: Number
	},
	lastReadMessage: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	},
	playSoundOnMessage: {
		type: Boolean,
		default: false
	},
	showMessageDesktopNotification: {
		type: Boolean,
		default: false
	},
	unreadMessageCount: {
		type: Number,
		 default: 0
	},
	// true/false is one of the unread messages had the user mentioned in it
	// In this case we'll highlight the count badge
	unreadMention: Boolean,
	// Date that unread messages began to accumulate
	// This allow a sort of lobby rooms by how long ago unread messages accumulated
	unreadStart: Date
});

module.exports = mongoose.model('RoomMember', roomMemberSchema, 'roommember');

var mongoose = require('mongoose');

var roomMemberSchema = new mongoose.Schema({
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
	}
});

module.exports = mongoose.model('RoomMember', roomMemberSchema, 'roommember');

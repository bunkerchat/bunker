var uuid = require('node-uuid');
var UserActions = require('../user/userActions');
var MembershipStore = require('./membershipStore');

var RoomStore = Reflux.createStore({
	listenables: [UserActions],

	rooms: {},
	messageLookup: {},

	getState() {
		return {
			rooms: this.rooms
		}
	},

	init() {
		this.listenTo(MembershipStore, this.onMembershipStoreUpdate);
		io.socket.on('room', this.onRoomMessage);
	},

	onMembershipStoreUpdate(memberships) {
		memberships.forEach(membership => {
			io.socket.get(`/room/${membership.room.id}/join`, (room, JWR) => {
				io.socket.get(`/room/${room.id}/messages`, (messages, JWR) => {
					room.$messages = messages.reverse();
					this.decorateMessages(room.$messages);

					this.rooms[room.id] = room;
					this.messageLookup[room.id] = {};
					this.trigger(this.rooms);
				});

				io.socket.get('/roomMember', {room: room.id}, (members, JWR)=> {
					room.$members = _(members)
						.map(this.decorateMember)
						.indexBy(roomMember => roomMember.user.id)
						.value();

					this.trigger(this.rooms);
				});
			});
		});
	},

	onRoomMessage(msg) {
		if (msg.verb == 'messaged') {
			this.addMessage(msg.id, msg.data);
			this.trigger(this.rooms);
		}
	},

	decorateMessage(lastMessage, message) {
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		message.createdAt = moment(message.createdAt);
	},

	decorateMessages(messages) {
		_.each(messages, (message, index) => {
			var lastMessage = index > 0 && index < messages.length ? messages[index - 1] : null;
			this.decorateMessage(lastMessage, message);
		});
	},

	addMessage(roomId, message) {
		if (!message.id) {
			message.id = uuid.v4(); // All messages need ids
		}

		var room = this.rooms[roomId];
		if (!room) throw new Error('Received message from a room we are not a member of!');
		if (this.messageLookup[roomId][message.id]) return; // Message already exists!
		//if (!user.settings.showNotifications && !message.author) return; // User does not want to see notifications

		var lastMessage = _.last(room.$messages);
		this.decorateMessage(lastMessage, message);

		room.$messages.push(message);
		this.messageLookup[roomId][message.id] = true; // Store messages in lookup object, this allows us to check for duplicates quickly
	},

	decorateMember(member) {
		member.lastActivity = moment(member.lastActivity);
		return member;
	},

	// actions

	onSendMessage(roomId, message) {
		io.socket.post('/message', {"room": roomId, "text": message}, (message, JWR) => {
			if (JWR.statusCode !== 200) {
				throw new Error(JWR);
			}
		});
	}
});

module.exports = RoomStore;
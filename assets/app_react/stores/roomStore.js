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
		this.listenTo(MembershipStore, memberships => {
			memberships.forEach(membership => {
				io.socket.get(`/room/${membership.room.id}/join`, (room, JWR) => {
					io.socket.get(`/room/${room.id}/messages`, (messages, JWR) => {
						room.$messages = messages.reverse();
						this.decorateMessages(room.$messages);

						this.rooms[room.id] = room;
						this.messageLookup[room.id] = {};
						this.trigger(this.rooms);
					});
				});
			});
		});

		io.socket.on('room', msg => {
			if(msg.verb == 'messaged'){
				this.addMessage(msg.id, msg.data);
				this.trigger(this.rooms);
			}
		});
	},

	decorateMessages(messages) {
		_.each(messages, function (message, index) {
			var lastMessage = index > 0 && index < messages.length ? messages[index - 1] : null;
			message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
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
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;

		room.$messages.push(message);
		this.messageLookup[roomId][message.id] = true; // Store messages in lookup object, this allows us to check for duplicates quickly
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
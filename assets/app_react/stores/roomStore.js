var UserActions = require('../user/userActions');
var MembershipStore = require('./membershipStore');

var RoomStore = Reflux.createStore({
	listenables: [UserActions],

	rooms: {},

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
						this.rooms[room.id] = room;
						this.trigger(this.rooms);
					});
				});
			});
		});
	},

	// actions

	onSendMessage(roomId, message) {
		io.socket.post('/message', {"room": roomId, "text": message}, (message, JWR) => {
			if(JWR.statusCode !== 200){
				//UserActions.sendMessage.failed(message);
			}
			//UserActions.sendMessage.completed(message);
			//this.
		});
	}
});

module.exports = RoomStore;
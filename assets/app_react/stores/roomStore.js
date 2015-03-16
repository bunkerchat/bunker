var UserActions = require('../user/userActions');
var MembershipStore = require('./membershipStore');

var RoomStore = Reflux.createStore({
	listenables: [UserActions],

	rooms:{},

	getDefaultData() {
		return {
			rooms: {}
		}
	},

	init() {
		this.listenTo(MembershipStore, memberships => {
			memberships.forEach(membership => {
				io.socket.get(`/room/${membership.room.id}/join`, (room, JWR) =>{
					io.socket.get(`/room/${room.id}/messages`, (messages, JWR) =>{
						room.$messages = messages;
						this.rooms[room.id] = room;
						console.log('room', room)
						this.trigger(this.rooms);
					});
				});
			});
		});
	}
});

module.exports = RoomStore;
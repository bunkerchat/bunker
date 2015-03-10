var UserActions = require('../user/userActions');
var MembershipStore = require('../user/membershipStore');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	rooms: [],

	getDefaultData() {
		return {
			rooms: []
		}
	},

	init() {
		this.listenTo(MembershipStore, this.onMembershipLoaded);
	},

	onMembershipLoaded(memberships) {
		memberships.forEach(membership => {
			var url = '/room/' + membership.room.id;
			io.socket.get(url, this.serverResponded);
		});
	},

	serverResponded(body, JWR) {
		console.log('room', body);
		this.rooms.push(body);
		this.trigger(this.rooms);
	}
});
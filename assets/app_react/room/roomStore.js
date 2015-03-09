var UserActions = require('../user/userActions');
var MembershipStore = require('../user/membershipStore');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	rooms: [],

	getDefaultData: function () {
		return {
			rooms:[]
		}
	},

	init: function () {
		this.listenTo(MembershipStore,this.onMembershipLoaded);
	},

	onMembershipLoaded: function (memberships) {
		memberships.forEach(function (membership) {
			io.socket.get('/room/'+membership.room.id, this.serverResponded.bind(this));
		})
	},

	serverResponded: function(body, JWR) {
		console.log('room', body);
		this.rooms.push(body);
		this.trigger(this.rooms);
	}
});
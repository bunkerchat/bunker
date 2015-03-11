var UserActions = require('./userActions');

var MembershipStore = Reflux.createStore({
	listenables: [UserActions],
	memberships: [],

	getDefaultData() {
		return {
			memberships: []
		}
	},

	init() {
		io.socket.get('/roomMember', {user: window.userId}, (body, JWR) => {
			console.log('roomMember', body);
			this.memberships = body;
			this.trigger(this.memberships);
		});
	},
});

module.exports = MembershipStore;
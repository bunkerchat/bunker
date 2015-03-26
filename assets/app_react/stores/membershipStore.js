var UserActions = require('./../user/userActions');

var MembershipStore = Reflux.createStore({
	listenables: [UserActions],
	memberships: [],

	getState() {
		return {
			memberships: this.memberships
		}
	},

	init() {
		io.socket.get('/roomMember', {user: window.userId}, (body, JWR) => {
			this.memberships = body;
			this.trigger(this.memberships);
		});
	}
});

module.exports = MembershipStore;
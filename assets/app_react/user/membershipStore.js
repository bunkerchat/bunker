var UserActions = require('./userActions');

module.exports = Reflux.createStore({
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
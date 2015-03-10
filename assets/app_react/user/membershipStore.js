var UserActions = require('./userActions');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	memberships: [],

	getDefaultData: function () {
		return {
			memberships: []
		}
	},

	init: function () {
		io.socket.get('/roomMember', {user: window.userId}, this.serverResponded.bind(this));
	},

	serverResponded: function(body, JWR) {
		console.log('roomMember', body);
		this.memberships = body;
		this.trigger(this.memberships);
	}
});
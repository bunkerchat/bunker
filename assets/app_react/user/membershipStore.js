var UserActions = require('./userActions');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	memberships: [],
	init: function () {
		var self = this;
		io.socket.get('/roomMember', {user: window.userId}, function serverResponded (body, JWR) {
			console.log('roomMember', body);
			self.memberships = body;
			self.trigger(this.memberships);
		});
	}

});
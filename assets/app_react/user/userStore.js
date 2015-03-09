var UserActions = require('./userActions');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	init: function () {
		var self = this;
		io.socket.get('/user/' + window.userId, function serverResponded (body, JWR) {
			console.log('user', body);
			self.current = body;
			self.trigger(this.current);
		});

		//io.socket.get('/roomMember/' + window.userId, function serverResponded (body, JWR) {
		//	this.memberships = body;
		//});
		//
		//io.socket.get('/userSettings/' + window.userId, function serverResponded (body, JWR) {
		//	this.settings = body;
		//});
	}

});
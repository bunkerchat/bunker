var UserActions = require('./userActions');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	init: function () {
		io.socket.get('/userSettings/' + window.userId, function serverResponded (body, JWR) {
			this.settings = body;
			this.trigger(this.settings);
		});
	}
});
var UserActions = require('./../user/userActions');

module.exports = Reflux.createStore({
	listenables: [UserActions],
	init() {
		io.socket.get('/userSettings/' + window.userId, (body, JWR) => {
			this.settings = body;
			this.trigger(this.settings);
		});
	}
});
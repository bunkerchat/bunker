var UserActions = require('./../user/userActions');

var SettingsStore = Reflux.createStore({
	listenables: [UserActions],

	settings: {
		showImages: false,
		showNotifications:false,
		minimalView: false,
		sortEmoticonsByPopularity: false
	},

	getState() {
		return this.settings;
	},

	init() {
		io.socket.get('/userSettings/', {user:window.userId}, (body, JWR) => {
			this.settings = body[0];
			this.trigger(this.settings);
		});
	}
});

module.exports = SettingsStore;
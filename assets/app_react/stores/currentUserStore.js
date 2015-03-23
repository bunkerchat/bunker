var UserActions = require('./../user/userActions');

var CurrentUserStore = Reflux.createStore({
	listenables: [UserActions],
	init() {
		io.socket.get(`/user/${window.userId}`, (body, JWR) => {
			console.log('user', body);
			this.user = body;
			this.trigger(this.user);
		});

	},

	onTyping(roomId){
			if (!this.user) return; // Not ready yet

			if (this.user.typingIn != roomId) { // Only need to do anything if it's not already set
				this.user.typingIn = roomId;
				io.socket.post(`/user/current/activity`, this.user);
			}

			if (this.user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (this.typingTimeout) clearTimeout(this.typingTimeout); // Cancel current timeout (if any)
				this.typingTimeout = setTimeout(() => {
					this.user.typingIn = null;
					io.socket.post(`/user/current/activity`, this.user);
					this.typingTimeout = null;
				}, 2000);
			}
	}

});

module.exports = CurrentUserStore;
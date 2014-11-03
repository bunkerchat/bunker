app.factory('user', function(bunkerApi, $timeout) {

	var typingTimeout;
	var user = bunkerApi.user.get({id: 'current'});
	var settings = bunkerApi.userSettings.get({id: 'current'});

	// TODO because we got the id of 'current' we aren't gonna get any user updates... very sad, please fix

	return {
		current: user,
		settings: settings,
		broadcastTyping: function(roomId) {

			if(!user.$resolved) return; // Not ready yet

			if(user.typingIn != roomId) { // Only need to do anything if it's not already set
				user.typingIn = roomId;
				user.$activity();
			}

			if(user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
				typingTimeout = $timeout(function () {
					user.typingIn = null;
					user.$activity();
					typingTimeout = null;
				}, 2000);
			}
		}
	};
});

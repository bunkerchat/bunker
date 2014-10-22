app.factory('user', function(bunkerApi, $timeout) {

	var typingTimeout,
		user = bunkerApi.user.get({id: 'current'});

	return {
		current: user,
		broadcastTyping: function(roomId) {

			if(!user.$resolved) return; // Not ready yet

			if(user.typingIn != roomId) { // Only need to do anything if it's not already set
				user.typingIn = roomId;
				user.$save();
			}

			if(user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
				typingTimeout = $timeout(function () {
					user.typingIn = null;
					user.$save();
					typingTimeout = null;
				}, 2000);
			}
		}
	};
});

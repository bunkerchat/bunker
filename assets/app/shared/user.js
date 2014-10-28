app.factory('user', function(bunkerApi, $http, $timeout) {

	var typingTimeout,
		user = bunkerApi.user.get({id: 'current'});

	// TODO because we got the id of 'current' we aren't gonna get any user updates... very sad, please fix

	return {
		current: user,
		broadcastTyping: function(roomId) {

			if(!user.$resolved) return; // Not ready yet

			var presentUrl = '/user/' + user.id + '/present';

			if(user.typingIn != roomId) { // Only need to do anything if it's not already set
				user.typingIn = roomId;
				$http.put(presentUrl, {typingIn: roomId, present: user.present});
			}

			if(user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
				typingTimeout = $timeout(function () {
					user.typingIn = null;
					$http.put(presentUrl, {typingIn: null, present: user.present});
					typingTimeout = null;
				}, 2000);
			}
		},
		broadcastPresent: function(present) {
			if(!user.$resolved) return; // Not ready yet
			user.present = present;
			$http.put('/user/' + user.id + '/present', {present: user.present});
		}
	};
});

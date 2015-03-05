app.factory('user', function (bunkerApi, $timeout) {

	var typingTimeout;
	var userId = window.userId;
	var user = bunkerApi.user.get({id: userId});
	var memberships = bunkerApi.roomMember.query({user: userId});
	var settings = bunkerApi.userSettings.get({user: userId});

	function toggleSetting(setting) {
		settings[setting] = !settings[setting];
		settings.$save();
	}

	function saveSettings() {
		settings.$save();
	}

	function broadcastTyping(roomId) {
		if (!user.$resolved) return; // Not ready yet

		if (user.typingIn != roomId) { // Only need to do anything if it's not already set
			user.typingIn = roomId;
			user.$activity();
		}

		if (user.typingIn) { // Only need to reset in 2 seconds if room is set
			if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
			typingTimeout = $timeout(function () {
				user.typingIn = null;
				user.$activity();
				typingTimeout = null;
			}, 2000);
		}
	}

	return {
		current: user,
		memberships: memberships,
		settings: settings,
		toggleSetting: toggleSetting,
		saveSettings: saveSettings,
		broadcastTyping: broadcastTyping
	};
});

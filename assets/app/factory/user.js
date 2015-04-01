app.factory('user', function (bunkerData, $notification) {

	function toggleSetting(settingName) {
		bunkerData.toggleUserSetting(settingName);
		checkForDesktopNotifications();
	}

	function checkForDesktopNotifications() {
		var hasRoomNotifications = _.any(bunkerData.memberships, function (membership) {
			return membership.showMessageDesktopNotification;
		});

		if (hasRoomNotifications || bunkerData.userSettings.desktopMentionNotifications) {
			$notification.requestPermission();
		}
	}

	// check message for nick or @all
	function checkForNickRegex() {
		return new RegExp(bunkerData.user.nick + '\\b|@[Aa]ll', 'i');
	}

	return {
		current: bunkerData.user, // should just use directly
		memberships: bunkerData.memberships, // should just use directly
		settings: bunkerData.userSettings, // should just use directly
		toggleSetting: toggleSetting,
		saveSettings: bunkerData.saveUserSettings, // should just use directly
		checkForNickRegex: checkForNickRegex
	};
});

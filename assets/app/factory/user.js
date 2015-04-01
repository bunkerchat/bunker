app.factory('user', function (bunkerApi, bunkerData, $notification) {

	var userId = window.userId;
	var memberships = bunkerApi.roomMember.query({user: userId});

	function toggleSetting(settingName) {
		bunkerData.toggleUserSetting(settingName);
		checkForDesktopNotifications();
	}

	function checkForDesktopNotifications() {
		var hasRoomNotifications = _.any(memberships, function (membership) {
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
		current: bunkerData.user,
		memberships: memberships,
		settings: bunkerData.userSettings, // should just use directly
		toggleSetting: toggleSetting,
		saveSettings: bunkerData.saveUserSettings,
		checkForNickRegex: checkForNickRegex
	};
});

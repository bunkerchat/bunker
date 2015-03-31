app.factory('notifications', function (user, $notification, $timeout, $log) {
	var loaded = false;

	$timeout(function () {
		loaded = true;
	}, 5000);

	function newMessage(room, message) {
		if(!loaded) return;

		// check user settings and current room settings to see what kind of messages
		// we are allowed to show

		if(user.settings.desktopMentionNotifications){
			if (!user.checkForNickRegex().test(message.text)) return;

			//TODO: Check if creating event listeners like this causes memory leaks
			var mention = $notification(room.name + " - bunker", {
				body: message.text,
				//dir: 'auto',
				//lang: 'en',
				tag: message.id,
				icon: '/assets/images/bunkerIcon.png'
				//delay: 30000 // in ms
				//focusWindowOnClick: true // focus the window on click
			});

			mention.$on('click', function () {
				console.log('click');
				// TODO: Set current the room to the clicked notification
			});

			mention.$on('close', function () {
				mention = null;
			});

			mention.$on('error', function (e) {
				$log.error('desktop notification error', e);
			});
		}

		// since there are a total of 1 + (n of rooms) possible notifications, each one of those
		// needs to be tracked separately depending on the set user settings




	}

	return {
		newMessage: newMessage
	}
});
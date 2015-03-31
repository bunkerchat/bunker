app.factory('notifications', function (user, $notification, $timeout, $log) {
	var loaded = false;
	var notification = null;

	$timeout(function () {
		loaded = true;
	}, 5000);

	function newMessage(room, message) {
		if(!loaded) return;
		if(notification) return;

		// check user settings and current room settings to see what kind of messages
		// we are allowed to show

		if(user.settings.desktopMentionNotifications){

		}

		// since there are a total of 1 + (n of rooms) possible notifications, each one of those
		// needs to be tracked separately depending on the set user settings

		notification = $notification(room.name, {
			body: message.text,
			//dir: 'auto',
			//lang: 'en',
			tag: message.id,
			icon: '/assets/images/bunkerIcon.png',
			delay: 30000 // in ms
			//focusWindowOnClick: true // focus the window on click
		});



		notification.$on('click', function () {
			console.log('click');

			// TODO: Set current the room to the clicked notification
		});

		notification.$on('close', function () {
			notification = null;
		});

		notification.$on('error', function (e) {
			$log.error('desktop notification error', e);
		});
	}

	return {
		newMessage: newMessage
	}
});
app.factory('desktopNotifications', function ($notification, $timeout, $log) {
	//$notification.requestPermission()
	//	.then(function (permission) {
	//		console.log(permission); // default, granted, denied
	//	});

	var loaded = false;
	var notification = null;

	$timeout(function () {
		loaded = true;
	}, 5000);

	function newMessage(room, message) {
		if(!loaded) return;
		if(notification) return;

		notification = $notification(room.name, {
			body: message.text,
			dir: 'auto',
			lang: 'en',
			tag: message.id,
			icon: '/assets/images/bunkerIcon.png',
			delay: 30000, // in ms
			focusWindowOnClick: true // focus the window on click
		});

		//notification.$on('click', function () {
		//	console.log('click');
		//});

		//notification.$on('show', function () {
		//	console.log('show');
		//});

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
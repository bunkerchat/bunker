app.factory('notifications', function ($rootScope, bunkerData, user, $notification, $timeout, $log, $state, ngAudio) {
	var loaded = false;
	var bunkerIsVisible = true;
	var mentionSound = ngAudio.load('/assets/sounds/mention.mp3');
	var roomSound = ngAudio.load('/assets/sounds/room.mp3');

	$timeout(function () {
		loaded = true;
	}, 5000);

	function newMessage(room, message) {

		if (!bunkerData.$resolved || !loaded) return;

		// check user settings and current room settings to see what kind of messages
		// we are allowed to show

		if (bunkerData.userSettings.desktopMentionNotifications) {
			desktopMentionNotify();
		}

		if (bunkerData.userSettings.playSoundOnMention) {
			if (bunkerIsVisible || !user.checkForNickRegex().test(message.text)) return;
			mentionSound.play();
		}

		// since there are a total of 1 + (n of rooms) possible notifications, each one of those
		// needs to be tracked separately depending on the set user settings

		function desktopMentionNotify() {
			if (!user.checkForNickRegex().test(message.text)) return;

			// if bunker is open and user is in room, don't show notification
			if (bunkerIsVisible && $rootScope.roomId == room.id) return;
			//if($rootScope.roomId == room.id) return;

			var decodedText = $('<div/>').html(message.text).text();
			//TODO: Check if creating event listeners like this causes memory leaks
			var mention = $notification(room.name + " - bunker", {
				body: decodedText,
				//dir: 'auto',
				//lang: 'en',
				tag: message.id,
				icon: '/assets/images/bunkerIcon.png'
				//delay: 30000 // in ms
				//focusWindowOnClick: true // focus the window on click
			});

			mention.$on('click', function () {
				$state.go('chat.room', {roomId: room.id});
			});

			mention.$on('close', function () {
				mention = null;
			});

			mention.$on('error', function (e) {
				$log.error('desktop notification error', e);
			});
		}

	}

	$rootScope.$on('visibilityShow', function () {
		bunkerIsVisible = true;
	});

	$rootScope.$on('visibilityHide', function () {
		bunkerIsVisible = false;
	});

	return {
		newMessage: newMessage
	};
});

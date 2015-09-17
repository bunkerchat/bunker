app.factory('notifications', function ($rootScope, bunkerData, $notification, $timeout, $log, $state) {
	var loaded = false;
	var bunkerIsVisible = true;
	var mentionSound = new Audio('/assets/sounds/mention.mp3');

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
			if (bunkerIsVisible || !bunkerData.mentionsUser(message.text)) return;
			mentionSound.play();
		}

		// since there are a total of 1 + (n of rooms) possible notifications, each one of those
		// needs to be tracked separately depending on the set user settings

		function desktopMentionNotify() {
			if (!bunkerData.mentionsUser(message.text) || !message.author) return;

			// if bunker is open and user is in room, don't show notification
			if (bunkerIsVisible && $rootScope.roomId == room.id) return;

			var decodedText = $('<div/>').html(message.text).text();

			//TODO: Check if creating event listeners like this causes memory leaks
			var mention = $notification(room.name + " - bunker", {
				body: message.author.nick + ': ' + decodedText,
				tag: message.id,
				icon: '/assets/images/bunkerIcon.png'
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

			// close timeout in 10 seconds
			$timeout(function () {
				mention.close();
			}, 5000)
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

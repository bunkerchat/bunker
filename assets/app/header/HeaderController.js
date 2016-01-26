app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, bunkerData, $window) {
	var header = this;

	header.bunkerData = bunkerData;
	header.currentVersion = true;
	header.currentRoomName = 'Bunker';

	bunkerData.$promise.then(function () {
		header.rooms = bunkerData.rooms;
		header.memberships = bunkerData.memberships;
		header.settings = bunkerData.userSettings;
		header.inbox = bunkerData.inbox;
		header.currentRoomName = roomName();
	});

	header.showOptions = !$state.is('lobby');

	header.changeSetting = function (settingName) {
		bunkerData.toggleUserSetting(settingName, settingName == 'desktopMentionNotifications');
		if (settingName == 'showDebugging' && bunkerData.userSettings.showDebugging) {
			angular.reloadWithDebugInfo();
		}
	};

	header.leaveRoom = function () {
		bunkerData.leaveRoom($rootScope.roomId)
			.then(function () {
				$state.go('lobby');
			});
	};

	header.toggleEmoticonMenu = function () {
		header.emoticonMenu = !header.emoticonMenu;
		header.inboxOpened = false;
	};

	header.toggleInbox = function () {
		header.emoticonMenu = false;
		header.inboxOpened = !header.inboxOpened;
	};

	header.toggleSettings = function () {
		header.emoticonMenu = false;
		header.inboxOpened = false;
	};

	header.showHelp = function () {
		$modal.open({
			templateUrl: '/assets/app/help/help.html',
			controller: 'HelpController',
			size: 'lg'
		});
	};

	header.dragRoomListeners = {
		orderChanged: function roomOrderChanged(evt) {
			for (var i = 0; i < header.rooms.length; i++) {
				var room = header.rooms[i];

				// check each membership
				var membership = _.findWhere(header.memberships, {room: room._id});

				membership.roomOrder = i;
			}
			bunkerData.saveRoomMemberSettings(header.memberships);
		}
	};

	header.reloadPage = function () {
		$window.location.reload();
	};

	$rootScope.$on('bunkerMessaged', function (evt, message) {
		if (!bunkerData.$resolved || message.room._id == $rootScope.roomId || (message.type == 'standard' && message.author._id == bunkerData.user._id)) {
			return;
		}

		if (message.type != 'standard' && message.type != 'buildNotification' && message.type != 'hangman' && message.type != 'fight') {
			return;
		}

		var otherRoom = bunkerData.getRoom(message.room._id);
		if (otherRoom) {
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
			if (bunkerData.mentionsUser(message.text)) {
				otherRoom.$unreadMention = true;
			}
		}
	});

	$rootScope.$on('bunkerDataLoaded', function (evt) {
		header.currentVersion = bunkerData.isClientCodeCurrent();
	});

	$rootScope.$on('roomIdChanged', function (evt, roomId) {
		header.currentRoomName = roomName();

		var room = bunkerData.getRoom(roomId);
		if (room) {
			room.$unreadMessages = 0;
			room.$unreadMention = false;
		}
	});

	$rootScope.$on('$stateChangeSuccess', function (evt, toState) {
		header.showOptions = toState.name != 'lobby';
	});

	$rootScope.$on('$stateChangeSuccess', function (evt, toState) {
		header.showOptions = toState.name != 'lobby';
	});

	function roomName(){
		return (bunkerData.getRoom(roomId) || {}).name || 'Bunker';
	}
});

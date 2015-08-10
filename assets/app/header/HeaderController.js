app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, bunkerData) {
	var self = this;

	bunkerData.$promise.then(function () {
		self.rooms = bunkerData.rooms;
		self.memberships = bunkerData.memberships;
		self.settings = bunkerData.userSettings;
		self.inbox = bunkerData.inbox;
	});

	this.showOptions = !$state.is('lobby');

	this.changeSetting = function (settingName) {
		bunkerData.toggleUserSetting(settingName, settingName == 'desktopMentionNotifications');
		if (settingName == 'showDebugging' && bunkerData.userSettings.showDebugging) {
			angular.reloadWithDebugInfo();
		}
	};

	this.leaveRoom = function () {
		bunkerData.leaveRoom($rootScope.roomId)
			.then(function () {
				$state.go('lobby');
			});
	};

	this.toggleEmoticonMenu = function () {
		this.emoticonMenu = !this.emoticonMenu;
		this.inboxOpened = false;
	};

	this.toggleInbox = function () {
		this.emoticonMenu = false;
		this.inboxOpened = !this.inboxOpened;
	};

	this.toggleSettings = function () {
		this.emoticonMenu = false;
		this.inboxOpened = false;
	};

	this.showHelp = function () {
		$modal.open({
			templateUrl: '/assets/app/help/help.html',
			controller: 'HelpController',
			size: 'lg'
		});
	};

	this.dragRoomListeners = {
		orderChanged: function roomOrderChanged(evt) {
			for (var i = 0; i < self.rooms.length; i++) {
				var room = self.rooms[i];

				// check each membership
				var membership = _.findWhere(self.memberships, {room: room.id});

				membership.roomOrder = i;
			}
			bunkerData.saveRoomMemberSettings(self.memberships);
		}
	};

	$rootScope.$on('bunkerMessaged', function (evt, message) {
		if (!bunkerData.$resolved || message.room.id == $rootScope.roomId || (message.type == 'standard' && message.author.id == bunkerData.user.id)) {
			return;
		}

		if (message.type != 'standard' && message.type != 'buildNotification' && message.type != 'hangman' && message.type != 'fight') {
			return;
		}

		var otherRoom = bunkerData.getRoom(message.room.id);
		if (otherRoom) {
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
			if (bunkerData.mentionsUser(message.text)) {
				otherRoom.$unreadMention = true;
			}
		}
	});

	$rootScope.$on('roomIdChanged', function (evt, roomId) {
		var room = bunkerData.getRoom(roomId);
		if (room) {
			room.$unreadMessages = 0;
			room.$unreadMention = false;
		}
	});

	$rootScope.$on('$stateChangeSuccess', function (evt, toState) {
		self.showOptions = toState.name != 'lobby';
	});
});

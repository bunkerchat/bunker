app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, bunkerData) {
	var self = this;

	bunkerData.$promise.then(function () {
		self.rooms = bunkerData.rooms;
		self.settings = bunkerData.userSettings;
	});

	this.showOptions = !$state.is('lobby');

	this.changeSetting = function (settingName) {
		bunkerData.toggleUserSetting(settingName, settingName == 'desktopMentionNotifications');
		if(settingName == 'showDebugging' && bunkerData.userSettings.showDebugging) {
			angular.reloadWithDebugInfo();
		}
	};

	this.leaveRoom = function () {
		bunkerData.leaveRoom($rootScope.roomId)
			.then(function () {
				$state.go('lobby');
			});
	};

	this.showHelp = function () {
		$modal.open({
			templateUrl: '/assets/app/help/help.html',
			controller: 'HelpController',
			size: 'lg'
		});
	};

	this.dragRoomListeners = {
		//accept: function (sourceItemHandleScope, destSortableScope) {return boolean}//override to determine drag is allowed or not. default is true.
		itemMoved: function (event) {console.log('itemMoved', event)},//Do what you want},
			orderChanged: function(event) {console.log('orderChanged', event)}//Do what you want},
				//containment: '#board'//optional param.
	};

	$rootScope.$on('bunkerMessaged', function (evt, message) {
		if (!bunkerData.$resolved || message.room.id == $rootScope.roomId || !message.author || message.author.id == bunkerData.user.id) {
			return;
		}

		var otherRoom = bunkerData.getRoom(message.room.id);
		if (otherRoom) {
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
		}
	});

	$rootScope.$on('roomIdChanged', function () {
		if ($rootScope.roomId) {
			bunkerData.getRoom($rootScope.roomId).$unreadMessages = 0;
		}
	});

	$rootScope.$on('$stateChangeSuccess', function(evt, toState) {
		self.showOptions = toState.name != 'lobby';
	});
});

app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, user, bunkerData) {
	var self = this;

	bunkerData.$promise.then(function() {
		self.rooms = bunkerData.rooms;
		self.settings = bunkerData.userSettings;
	});

	this.showOptions = function () {
		return !$state.is('lobby');
	};

	this.changeSetting = user.toggleSetting;

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
});

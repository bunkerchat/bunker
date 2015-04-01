app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, user, bunkerData) {
	var self = this;
	this.user = user.current;

	bunkerData.$promise.then(function() {
		self.rooms = bunkerData.rooms;
		self.settings = bunkerData.userSettings;
	});

	this.memberships = user.memberships;
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

	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model != 'room' || resource.id == $rootScope.roomId || !user.current.$resolved || !resource.data.author || resource.data.author.id == user.current.id || resource.data.edited) {
			return;
		}

		var otherRoom = _.find(bunkerData.rooms, {id: resource.id});
		if (otherRoom) {
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
		}
	});

	$rootScope.$on('roomIdChanged', function () {
		if ($rootScope.roomId) {
			_.find(bunkerData.rooms, {id: $rootScope.roomId}).$unreadMessages = 0;
		}
	});
});

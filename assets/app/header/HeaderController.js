app.controller('HeaderController', function ($rootScope, $stateParams, $state, $modal, user, rooms) {
	var self = this;
	this.user = user.current;
	this.memberships = user.memberships;
	this.settings = user.settings;
	this.showOptions = function () {
		return !$state.is('lobby');
	};

	this.changeSetting = user.toggleSetting;

	this.leaveRoom = function () {
		rooms.leave($rootScope.roomId);
		$state.go('lobby');
	};

	this.showHelp = function () {
		$modal.open({
			templateUrl: '/assets/app/help/help.html',
			controller: 'HelpController'
		});
	};

	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model != 'room' || resource.id == $rootScope.roomId || !user.current.$resolved || !resource.data.author || resource.data.author.id == user.current.id || resource.data.edited) {
			return;
		}

		var otherRoom = _(self.memberships).pluck('room').find({id: resource.id});
		if (otherRoom) {
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
		}
	});

	$rootScope.$on('roomIdChanged', function () {
		if ($rootScope.roomId) {
			var currentRoom = _(self.memberships).pluck('room').find({id: $rootScope.roomId});
			if (currentRoom) {
				currentRoom.$unreadMessages = 0;
			}
		}
	});
});

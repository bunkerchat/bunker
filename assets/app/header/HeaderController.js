app.controller('HeaderController', function ($rootScope, $stateParams, $state, user, rooms) {
	var self = this;
	this.user = user.current;
	this.memberships = user.memberships;
	this.settings = user.settings;
	this.showOptions = function () {
		return !$state.is('lobby');
	};

	this.changeSetting = user.toggleSetting;

	this.leaveRoom = function () {
		rooms.leave($stateParams.roomId);
		$state.go('lobby');
	};

	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id != $stateParams.roomId && resource.data.author && !resource.data.edited) {
			var otherRoom = _(self.memberships).pluck('room').find({id: resource.id});
			otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
		}
	});

	$rootScope.$on('$stateChangeSuccess', function () {
		if ($stateParams.roomId) {
			var currentRoom = _(self.memberships).pluck('room').find({id: $stateParams.roomId});
			if(currentRoom) {
				currentRoom.$unreadMessages = 0;
			}
		}
	});
});

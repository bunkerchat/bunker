app.controller('HeaderController', function ($rootScope, $stateParams, $state, user, rooms, emoticons) {
	var self = this;
	this.user = user.current;
	this.settings = user.settings;
	this.emoticons = emoticons;
	this.showOptions = function () {
		return !$state.is('lobby');
	};

	this.changeSetting = user.toggleSetting;

	this.leaveRoom = function () {
		var room = rooms($stateParams.roomId);
		room.$leave(function () {
			$state.go('lobby');
		});
	};

	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.data.author && !resource.data.edited) {
			var otherRoom = _.find(user.current.rooms, {id: resource.id});
			if (resource.id != $stateParams.roomId) {
				otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
			}
		}
	});

	$rootScope.$on('$stateChangeSuccess', function() {
		if($stateParams.roomId) {
			var currentRoom = _.find(user.current.rooms, {id: $stateParams.roomId});
			currentRoom.$unreadMessages = 0;
		}
	});
});

app.controller('HeaderController', function ($rootScope, $stateParams, $state, user, rooms, emoticons) {
	var self = this;
	this.user = user.current;
	this.memberships = user.memberships;
	this.settings = user.settings;
	this.emoticons = emoticons;
	this.showOptions = function () {
		return !$state.is('lobby');
	};

	this.changeSetting = function (setting) {
		self.settings[setting] = !self.settings[setting];
		self.settings.$save();
	};
	this.leaveRoom = function () {
		var room = rooms($stateParams.roomId);
		room.$leave(function () {
			$state.go('lobby');
		});
	};

	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.data.author && !resource.data.edited) {
			var otherRoom = _.find(self.memberships, function(membership) { return membership.room.id == resource.id; });
			if (resource.id != $stateParams.roomId) {
				otherRoom.$unreadMessages = otherRoom.$unreadMessages ? otherRoom.$unreadMessages + 1 : 1;
			}
		}
	});

	$rootScope.$on('$stateChangeSuccess', function () {
		if ($stateParams.roomId) {
			self.memberships.$promise.then(function() {
				var currentRoom = _.find(self.memberships, function(membership) { return membership.room.id == $stateParams.roomId; });
				if(currentRoom) {
					currentRoom.$unreadMessages = 0;
				}
			});
		}
	});
});

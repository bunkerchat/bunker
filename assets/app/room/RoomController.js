app.controller('RoomController', function ($scope, bunkerApi, user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;
	this.roomMembers = bunkerApi.roomMember.query({room: currentRoom.id});

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	this.mentionUser = function (userNick) {
		$scope.$broadcast('inputText', '@' + userNick);
	};

	$scope.$watch('room.roomMembers', function (newVal, oldVal) {
		if(!oldVal) return;
		self.memberLookup = _.indexBy(self.roomMembers, function(roomMember) { return roomMember.user.id; });
	}, true);

	$scope.$on('$sailsResourceUpdated', function(evt, resource) {
		if(resource.model == 'user') {
			var roomMember = self.memberLookup[resource.id];
			if(roomMember) {
				angular.extend(roomMember.user, resource.data);
			}
		}
	});
});

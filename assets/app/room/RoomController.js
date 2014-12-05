app.controller('RoomController', function ($rootScope, $scope, user, rooms, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	this.mentionUser = function (userNick) {
		$rootScope.$broadcast('inputText', '@' + userNick);
	};
	this.loadPreviousMessages = function() {
		return rooms.loadMessages(self.current.id);
	};

	// Watch for updates to the room members
	// Only applies to users who join the room for the first time or leave it entirely
	$scope.$watch('room.current.$members', function (newVal, oldVal) {
		if (!oldVal) return;
		self.memberLookup = _.indexBy(self.current.$members, function (roomMember) {
			return roomMember.user.id;
		});
	}, true);
});

app.filter('membersOrderBy', function () {
	return function (members) {
		return _(members)
			.sortBy(function (member) {
				return member.user.nick.toLowerCase();
			})
			.value();
	};
});

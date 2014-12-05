app.controller('RoomController', function ($rootScope, $scope, user, rooms, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	// This will join a member to the room for simply visiting the URL of it
	// TODO What should happen is the user should be prompted by a modal to join the room, with a password if it's private
	currentRoom.$members.$promise.then(function(members) {
		if(!_.any(members, function(member) { return member.user.id == user.current.id; })) {
			rooms.join(self.current.id);
		}
	});

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

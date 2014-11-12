app.controller('RoomController', function ($scope, user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	this.mentionUser = function (userNick) {
		$scope.$broadcast('inputText', '@' + userNick);
	};

	$scope.$watch('room.current.$members', function (newVal, oldVal) {
		if (!oldVal) return;
		self.memberLookup = _.indexBy(self.current.$members, function (roomMember) {
			return roomMember.user.id;
		});
	}, true);

	$scope.$on('$sailsResourceUpdated', function (evt, resource) {
		if (resource.model == 'user') {
			var roomMember = self.memberLookup[resource.id];
			if (roomMember) {
				angular.extend(roomMember.user, resource.data);
			}
		}
	});
});

app.filter('roomMemberFilter', function () {
	return function (members) {
		return _(members)
			.sortBy(function (member) {
				return member.user.nick.toLowerCase();
			})
			.filter(function (member) {
				return member.user.connected;
			})
			.value();
	};
});

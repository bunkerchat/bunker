app.directive('roomid', function ($rootScope, $stateParams, user, rooms) {
	return {
		scope: {
			roomId: '@roomid'
		},
		templateUrl: '/assets/app/room/room.html',
		link: function ($scope) {

			$scope.userService = user;
			$scope.$stateParams = $stateParams;
			$scope.current = rooms.get($scope.roomId);

			$scope.now = function () {
				return moment().format('YYYY-MM-DD');
			};
			$scope.mentionUser = function (userNick) {
				$rootScope.$broadcast('inputText', '@' + userNick);
			};
			$scope.loadPreviousMessages = function () {
				return rooms.loadMessages($scope.current.id, $scope.current.$messages.length);
			};

			// Watch for updates to the room members
			// Only applies to users who join the room for the first time or leave it entirely
			$scope.$watch('current.$members', function (newVal, oldVal) {
				if (!oldVal) return;
				$scope.memberLookup = _.indexBy($scope.current.$members, function (roomMember) {
					return roomMember.user.id;
				});
			}, true);
		}
	}
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

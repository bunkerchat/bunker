app.directive('room', function ($rootScope, bunkerData) {
	return {
		scope: {
			roomId: '@room'
		},
		templateUrl: '/assets/app/room/room.html',
		link: function ($scope) {

			$scope.user = bunkerData.user;
			$scope.settings = bunkerData.userSettings;

			bunkerData.$promise.then(function () {
				$scope.current = bunkerData.getRoom($scope.roomId);

				// Setup this watch once we have data
				$scope.$watch(function () {
					return $scope.current.$members.length;
				}, function () {
					if (!$scope.current.$members) return;
					$scope.memberLookup = _.indexBy($scope.current.$members, function (roomMember) {
						return roomMember.user.id;
					});
				});
			});

			$scope.now = function () {
				return moment().format('YYYY-MM-DD');
			};
			$scope.mentionUser = function (userNick) {
				$rootScope.$broadcast('inputText', '@' + userNick);
			};
			$scope.loadPreviousMessages = function () {
				return bunkerData.loadMessages($scope.current, $scope.current.$messages.length);
			};
		}
	}
});

app.filter('membersOrderBy', function () {
	return function (members) {
		return _(members)
			.select(function (member) {
				return member.user.connected;
			})
			.sortBy(function (member) {
				var user = member.user;
				return (user.$present ? '000' : '999') + user.nick.toLowerCase();
			})
			.value();
	};
});

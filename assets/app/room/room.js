app.directive('roomid', function ($rootScope, $stateParams, bunkerData) {
	return {
		scope: {
			roomId: '@roomid'
		},
		templateUrl: '/assets/app/room/room.html',
		link: function ($scope) {

			$scope.user = bunkerData.user;
			$scope.$stateParams = $stateParams;

			bunkerData.$promise.then(function () {
				$scope.current = bunkerData.getRoom($scope.roomId);

				// Setup this watch once we have data
				$scope.$watch(function () {
					return JSON.stringify($scope.current.$members);
				}, function () {
					if (!$scope.current.$members) return;
					$scope.memberLookup = _.indexBy($scope.current.$members, function (roomMember) {
						return roomMember.user.id;
					});
				}, true);
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
				var away = user.busy || (!user.present && moment().diff(moment(user.lastActivity), 'minutes') > 5);
				return (away ? '1' : '0') + member.user.nick.toLowerCase();
			})
			.value();
	};
});

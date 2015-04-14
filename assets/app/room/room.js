app.directive('room', function ($rootScope, bunkerData, $state) {
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

				// Setup watches once we have data

				$scope.$watchCollection('current.$members', function (members) {
					if (!members) return;
					$scope.memberLookup = _.indexBy(members, function (roomMember) {
						return roomMember.user.id;
					});
				});

				updateMemberList();
			});

			$scope.openHistory = function () {
				$state.go('roomHistory', {roomId: $scope.roomId, date: moment().format('YYYY-MM-DD')});
			};
			$scope.mentionUser = function (userNick) {
				$rootScope.$broadcast('inputText', '@' + userNick);
			};
			$scope.loadPreviousMessages = function () {
				return bunkerData.loadMessages($scope.current, $scope.current.$messages.length);
			};
			$rootScope.$on('userUpdated', updateMemberList);

			function updateMemberList() {
				$scope.memberList =  _($scope.current.$members)
					.select(function (member) {
						return member.user.connected;
					})
					.sortBy(function (member) {
						var user = member.user;
						return (user.$present ? '000' : '999') + user.nick.toLowerCase();
					})
					.value();
			}
		}
	}
});

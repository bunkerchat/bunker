app.controller('ChatController', function ($rootScope, $scope, $stateParams, $state, user) {
	var self = this;

	$scope.$watch(function () {return user.memberships; }, function () {
		self.rooms = _.pluck(user.memberships, 'room');
		selectRoom();
	}, true);

	$rootScope.$on('roomIdChanged', selectRoom);

	function selectRoom() {
		_.each(self.rooms, function (room) {
			room.$selected = room.id == $rootScope.roomId;
		});
	}
});

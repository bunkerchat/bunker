app.controller('ChatController', function ($rootScope, $scope, $stateParams, $state, user) {
	var self = this;

	$scope.$watch(function() { return user.memberships; }, function() {
		self.rooms = _.pluck(user.memberships, 'room');
		if(self.rooms.length > 0) {
			_.find(self.rooms, {id: $stateParams.roomId}).$selected = true;
		}
	}, true);

	$rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {
		if(toState.name === 'chat' && fromState.name === 'chat') {
			//evt.preventDefault();
			//_.find(self.rooms, {id: toParams.roomId}).$selected = true;
		}
		console.log(toState);
	});
});

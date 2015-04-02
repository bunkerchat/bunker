app.directive('status', function () {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			user: '=status'
		},
		templateUrl: '/assets/app/directives/status.html',
		link: function ($scope) {
			$scope.away = _.throttle(function () {
				if (!$scope.user) return false;
				if ($scope.user.busy) return true;
				return !$scope.user.present && moment().diff(moment($scope.user.lastActivity), 'minutes') > 5;
			}, 250);
		}
	};
});

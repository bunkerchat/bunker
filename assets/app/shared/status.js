app.directive('status', function () {
	return {
		restrict: 'EA',
		scope: {
			user: '=status'
		},
		templateUrl: '/assets/app/shared/status.html',
		link: function ($scope) {
			$scope.away = _.throttle(function(){
				return moment().diff(moment($scope.user.lastActivity), 'minutes') > 5;
			}, 250);
		}
	};
});

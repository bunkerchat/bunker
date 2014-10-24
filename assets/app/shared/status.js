app.directive('status', function () {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			user: '=status'
		},
		templateUrl: '/assets/app/shared/status.html',
		link: function (scope) {
			scope.away = _.throttle(function () {
				if (!scope.user) return false;
				return !scope.user.present && moment().diff(moment(scope.user.updatedAt), 'minutes') > 5;
			}, 250);
		}
	};
});

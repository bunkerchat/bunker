app.directive('customStylesheet', function (user, $window, $timeout) {
	return {
		link: function (scope) {
			scope.loadMinimal = false;

			scope.$watch(function () {
				return user.settings;
			}, function () {
				if (!user.settings.$resolved) return;
				scope.loadMinimal = user.settings.minimalView;

				// if we change stylesheets, trigger a resize
				$timeout(function () {
					angular.element($window).resize();
				}, 500);
			}, true);
		}
	};
});

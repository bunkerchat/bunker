app.directive('customStylesheet', function (user, $window, $timeout) {
	return {
		link: function (scope) {
			scope.stylesheet = 'default';
			scope.$watch(function () {
				return user.settings;
			}, function () {
				if (!user.settings.$resolved) return;
				var originalStylesheet = scope.stylesheet;
				scope.stylesheet = user.settings.minimalView ? 'minimal' : 'default';

				// If we're changing stylesheets, trigger a window resize
				if (originalStylesheet != scope.stylesheet) {
					$timeout(function () {
						angular.element($window).resize();
					}, 500);
				}
			}, true);
		}
	};
});

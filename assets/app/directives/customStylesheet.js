app.directive('customStylesheet', function (bunkerData, $window, $timeout) {
	return {
		link: function ($scope) {

			$scope.loadMinimal = false;

			bunkerData.$promise.then(function () {

				$scope.$watch(function () {
					return bunkerData.userSettings;
				}, function () {

					$scope.loadMinimal = bunkerData.userSettings.minimalView;

					// if we change stylesheets, trigger a resize
					$timeout(function () {
						angular.element($window).resize();
					}, 500);
				}, true);
			});
		}
	};
});

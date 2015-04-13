app.directive('customStylesheet', function ($rootScope, bunkerData, $window, $timeout) {
	return {
		link: function ($scope) {

			$scope.loadMinimal = false;

			$rootScope.$on('userSettingsUpdated', function() {
				$scope.loadMinimal = bunkerData.userSettings.minimalView;

				// if we change stylesheets, trigger a resize
				$timeout(function () {
					angular.element($window).resize();
				}, 500);
			});
		}
	};
});

app.directive('customStylesheet', function ($rootScope, bunkerData, $window, $timeout) {
	return {
		link: function ($scope) {

			function setStylesheet() {
				var oldValue = $scope.loadMinimal;
				$scope.loadMinimal = bunkerData.userSettings.minimalView;

				if (oldValue != $scope.loadMinimal) {
					// if we change stylesheets, trigger a resize
					$timeout(function () {
						angular.element($window).resize();
					}, 500);
				}
			}

			bunkerData.$promise.then(setStylesheet);
			$rootScope.$on('userSettingsUpdated', setStylesheet);
		}
	};
});

app.directive('customStylesheet', function ($rootScope, bunkerData, $window) {
	return {
		link: function ($scope) {

			function setStylesheet() {
				var oldValue = $scope.loadMinimal;
				$scope.loadMinimal = bunkerData.userSettings.minimalView;

				if (oldValue != $scope.loadMinimal) {
					// if we change stylesheets, trigger a resize
					_.defer(function () {
						angular.element($window).resize();
					});
				}
			}

			bunkerData.$promise.then(setStylesheet);
			$rootScope.$on('userSettingsUpdated', setStylesheet);
		}
	};
});

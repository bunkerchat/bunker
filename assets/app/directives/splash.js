app.directive('splash', function (bunkerData, $timeout) {
	return function ($scope, $element) {

		$scope.loading = true;

		var listener = $scope.$watch(function () {
			return bunkerData.$resolved;
		}, function (resolved) {

			if (resolved) {
				$timeout(function() {
					angular.element($element).empty();
					$scope.loading = false;
				}, 500);

				// We're done loading, remove watch and empty splash elements
				listener();
			}
		});
	};
});

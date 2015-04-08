app.directive('splash', function (bunkerData) {
	return function ($scope, $element) {
		var listener = $scope.$watch(function () {
			return bunkerData.$resolved;
		}, function (resolved) {

			$scope.loading = !resolved;

			if (!$scope.loading) {
				// We're done loading, remove watch and empty splash elements
				listener();
				angular.element($element).empty();
			}
		});
	};
});

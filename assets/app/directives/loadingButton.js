app.directive("loadingButton", function() {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		template: '<button ng-click="triggerAction()" ng-disabled="isProcessing" class="loadingbutton"><i ng-show="isProcessing" class="fa fa-spin fa-spinner loadingbutton-spinner"></i><span ng-transclude></span></button>',
		scope: {
			action: "&"
		},
		controller: function($scope){
			$scope.isProcessing = false;

			$scope.triggerAction = function() {
				if (!$scope.action) {
					return;
				}
				var promise = $scope.action();

				if (!promise || !promise.then) {
					return;
				}

				$scope.isProcessing = true;

				promise.then(function(){
					$scope.isProcessing = false;
				}, function() {
					$scope.isProcessing = false;
				});
			};
		}
	}
});
app.directive("loadingButton", function($document) {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		template: '<button ng-click="loadingButton.triggerAction()" ng-disabled="loadingButton.isProcessing" class="loadingbutton"><i ng-show="loadingButton.isProcessing" class="fa fa-spin fa-spinner loadingbutton-spinner"></i><span ng-transclude></span></button>',
		scope: {
			action: "&"
		},
		controller: function($scope){
			var self = this;

			this.isProcessing = false;

			this.triggerAction = function() {
				if (!$scope.action) {
					return;
				}
				var promise = $scope.action();

				if (!promise || !promise.then) {
					return;
				}

				self.isProcessing = true;

				promise.then(function(){
					self.isProcessing = false;
				}, function() {
					self.isProcessing = false;
				});
			};
		},
		controllerAs: "loadingButton",
		link: function(scope, element, attrs, ctrl) {

			// I don't think i like dis. Doesn't work if multiple instances of this directive are
			// in the dom at the same time.
			if (attrs.bindtoenter && attrs.bindtoenter === 'true') {
				$document.on('keydown.loadingButton', function(e) {
					if (e.which === 13) {
						scope.$apply(function() {
							ctrl.triggerAction();
						});

						e.preventDefault();
					}
				});

				scope.$on('$destroy', function () {
					$document.off('.loadingButton');
				});
			}
		}
	};
});
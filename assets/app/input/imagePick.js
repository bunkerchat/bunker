app.directive('imagePick', function ($rootScope, $modal) {
	return {
		//templateUrl: '/assets/app/input/imagePick.html',
		bindToController: true,
		controllerAs: 'imagePick',
		controller: function ($scope) {
			var self = this;
			$scope.$on('userMessaged_pick', function (evt, data) {
				var modalInstance = $modal.open({
					size: 'lg',
					templateUrl: '/assets/app/input/imagePick.html',
					controllerAs: 'modal',
					controller: function ($modalInstance) {
						this.images = data;

						this.set = function (image) {
							$rootScope.$broadcast('inputText', image);
							$modalInstance.dismiss();
						};

						this.cancel = function () {
							$modalInstance.dismiss();
						};
					}
				});
			});
		}
	};
});
app.directive('imagePick', function ($rootScope, $modal) {
	return {
		//templateUrl: '/assets/app/input/imagePick.html',
		bindToController: true,
		controllerAs: 'imagePick',
		controller: function ($scope) {
			var self = this;
			$scope.$on('userMessaged_pick', function (evt, userData) {
				var modalInstance = $modal.open({
					size: 'lg',
					templateUrl: '/assets/app/input/imagePick.html',
					controllerAs: 'modal',
					controller: function ($modalInstance) {
						this.images = userData.data;

						this.set = function (image) {
							$rootScope.$broadcast('inputText', userData.message + image);
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
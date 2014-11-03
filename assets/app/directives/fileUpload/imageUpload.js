app
	.controller('ImageUpload', function ($scope, imageUpload, imageFile, $modalInstance) {

		var self = this;

		self.imageAsDataUri = null;
		self.progress = -1;

		var fileReader = new FileReader();
		fileReader.onload = function (event) {
			self.imageAsDataUri = event.target.result;
			$scope.$apply();
		};

		fileReader.readAsDataURL(imageFile);

		this.doUpload = function () {
			var uploadPromise = imageUpload
				.doSingleImageUpload(self.imageAsDataUri.split(',')[1]);

			uploadPromise.then(function (imageUrl) {
				$modalInstance.close(imageUrl);
			}, function (error) {
				// TODO: image upload error handling.
			});

			return uploadPromise;
		};

		this.cancel = function () {
			$modalInstance.dismiss('cancel');
		}
	});
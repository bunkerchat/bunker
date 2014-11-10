app
	.controller('ImageUpload', function ($scope, imageUpload, imageData, $modalInstance) {

		var self = this;

		self.imageAsDataUri = imageData;
		self.progress = -1;

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

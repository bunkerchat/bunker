angular
	.module('fileEvents', ['ui.bootstrap'])

	.factory('imageUpload', function ($http, $q) {

		return {
			doSingleImageUpload: function (base64ImageData, progress) {

				return $q(function (resolve, reject) {
					var xmlHttpRequest = new XMLHttpRequest();
					xmlHttpRequest.open('POST', 'https://api.imgur.com/3/image');

					xmlHttpRequest.setRequestHeader('Authorization', 'Client-ID ' + 'f9b49a92d8ec31b');
					xmlHttpRequest.setRequestHeader('Accept', 'application/json');

					xmlHttpRequest.onload = function (e) {
						// right now just resolving the image link... might need to send more.
						resolve(JSON.parse(e.target.responseText).data.link);
					};

					xmlHttpRequest.onerror = reject;

					if (xmlHttpRequest.upload && progress) {
						xmlHttpRequest.upload.addEventListener('progress', progress, false);
					}

					var formData = new FormData();
					formData.append('type', 'base64');
					formData.append('image', base64ImageData);

					xmlHttpRequest.send(formData);
				});
			}
		};

	})

	.controller('ImageUpload', function ($scope, imageUpload, imageFile, $modalInstance) {

		var self = this;

		self.imageAsDataUri = null;

		var readImageFile = function () {
			var fileReader = new FileReader();
			fileReader.onload = function (event) {
				self.imageAsDataUri = event.target.result;
				$scope.$apply(); // do this b/c the filereader onload doesn't.
			};

			fileReader.readAsDataURL(imageFile);
		};

		readImageFile();

		// TODO: do something about errors
		// TODO: progress indicator!
		this.doUpload = function () {
			imageUpload
				.doSingleImageUpload(self.imageAsDataUri.split(',')[1])
				.then(function (imageUrl) {
					$modalInstance.close(imageUrl);
				}, function (error) {
					// TODO: image upload error handling.
				});
		};

		this.cancel = function () {
			$modalInstance.dismiss('cancel');
		}
	})

	.controller('FileError', function (errorMessage, $modalInstance) {
		this.error = errorMessage;

		this.close = function () {
			$modalInstance.dismiss('close');
		};
	})

	.directive('bunkerDropzone', function ($document, imageUpload, $modal, $rootScope, $compile) {

		// TODO: move this in to controller.
		var methods = {
			isImageFile: function (item) {
				// TODO: can probably change this to just be a regex: /image.*/
				return item.type && (
					_.contains(item.type, '/jpeg') ||
					_.contains(item.type, '/jpg') ||
					_.contains(item.type, '/gif') ||
					_.contains(item.type, '/png'));
			}
		};

		return {
			restrict: 'A',
			scope: true,
			link: function (scope, element) {

				/* There's gotta be a better way to do this */
				var overlay = angular.element('<div id="bunker-dropzone-overlay" overlay-contents></div>');
				element
					.append(overlay);
				$compile(overlay)(scope);

				var modalOpen = false,
					setModalClose = function () {
						modalOpen = false;
					};

				var doImageUpload = function (file) {
					var error = null;

					// TODO: refactor this in to something more generic.
					if (!methods.isImageFile(file)) {
						error = 'Unsupported file type.  Only images are supported.';
					}
					else if (file.size > 4 * 1024 * 1024) {
						error = 'The file is too large! Files can be a maximum of 4MB.';
					}

					modalOpen = true;

					if (error) {
						$modal.open({
							templateUrl: '/assets/app/room/fileEvents/fileError.html',
							controller: 'FileError as fileError',
							resolve: {
								errorMessage: function () {
									return error;
								}
							}
						})
							.result
							.then(setModalClose, setModalClose);
					}
					else {
						$modal.open({
							templateUrl: '/assets/app/room/fileEvents/imageUpload.html',
							controller: 'ImageUpload as imageUpload',
							resolve: {
								imageFile: function () {
									return file;
								}
							},
							size: 'lg'
						})
							.result
							.then(function (url) {
								setModalClose();
								$rootScope.$broadcast('inputText', url);
							}, setModalClose);
					}
				};

				element
					.on('dragover.dropzone', function (e) {
						e.preventDefault(); // this must be here otherwise the browser won't listen for the drop event.
					})
					.on('dragbetterenter.dropzone', function () {
						if (!modalOpen) {
							$(this).addClass('dragover');
						}
					})
					.on('dragbetterleave.dropzone', function () {
						$(this).removeClass('dragover');
					})
					.on('drop.dropzone', function (e) {

						e.preventDefault();

						if (modalOpen) {
							return;
						}

						var files = e.originalEvent.dataTransfer.files,
							file = files.length ? files[0] : null;

						if (!file) {
							return;
						}

						doImageUpload(file);
					});

				// we listen on doc element also to swallow "missed" drops.
				// also listening for paste!
				$document
					.on('dragover.dropzone', function (e) {
						e.preventDefault();
					})
					.on('drop.dropzone', function (e) {
						e.preventDefault();
					})
					.on('paste.dropzone', function (e) {

						if (!e.originalEvent.clipboardData) {
							return;
						}

						var copiedImage = _.find(e.originalEvent.clipboardData.items, function (item) {
							return methods.isImageFile(item);
						});

						if (!copiedImage) {
							return;
						}

						// we have a valid image, do things!
						e.preventDefault();

						doImageUpload(copiedImage.getAsFile());
					});

				scope.$on('$destroy', function () {
					element.off('.dropzone');
					$document.off('.dropzone');
				});

			}
		};
	});


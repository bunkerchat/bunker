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


				// jQuery codes
				//
				// $.ajax({
				//   xhr: function() {
				//     var xhr = new XMLHttpRequest();

				//     xhr.upload.addEventListener('progress', handleProgress, false);
				//     // xhr.addEventListener('progress', handleProgress, false); // only required for download

				//     return xhr;
				//   },
				//   url: 'https://api.imgur.com/3/image',
				//   type: 'POST',
				//   headers: {
				//     Authorization: 'Client-ID ' + 'f9b49a92d8ec31b',
				//     Accept: 'application/json'
				//   },
				//   data: {
				//     image: datas,
				//     type: 'base64'
				//   },
				//   success: function(result) {
				//     $('#finalImage').val(result.data.link);
				//     console.log(result);
				//   }
				// });
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

		// TODO: do something about errors, css/formatting for modal, notify caller of image URL.
		this.doUpload = function () {
			imageUpload.doSingleImageUpload(self.imageAsDataUri.split(',')[1]);
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

	.directive('bunkerDropzone', function ($document, imageUpload, $modal) {
		return {
			restrict: 'A',
			scope: true,
			link: function (scope, element) {

				/* There's gotta be a better way to do this */
				element
					.append('<div id="bunker-dropzone-overlay">drop images here!</div>');

				var modalOpen = false,
					setModalClose = function () {
						modalOpen = false;
					};

				element
					.on('dragover.dropzone', function (e) {
						e.preventDefault();
					})
					.on('dragbetterenter.dropzone', function (e) {
						if (modalOpen) {
							e.preventDefault();
							return;
						}
						$(this).addClass('dragover');
					})
					.on('dragbetterleave.dropzone', function (e) {
						if (modalOpen) {
							e.preventDefault();
							return;
						}
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

						var error = null,
							type = file.type;

						// TODO: refactor this in to something more generic.
						if (!file.type || !(
							_.contains(type, '/jpeg') ||
							_.contains(type, '/jpg') ||
							_.contains(type, '/gif') ||
							_.contains(type, '/png'))) {

							error = 'Unsupported file type.  Only images are allowed currently.';
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
							});
							// TODO: send final URL to message directive.
						}
					});

				// we listen on doc element also to swallow "missed" drops.
				$document
					.on('dragover.dropzone', function (e) {
						e.preventDefault();
					})
					.on('drop.dropzone', function (e) {
						e.preventDefault();
					});

				scope.$on('$destroy', function () {
					element.off('.dropzone');
					$document.off('.dropzone');
				});

			}
		};
	});


angular
	.module('fileEvents', ['ui.bootstrap'])

	.factory('imageUpload', function ($http, $q) {

		return {
			doSingleImageUpload: function (base64ImageData, progress) {

				return $q(function(resolve, reject) {
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

	.controller('ImageUpload', function(imageUpload, imageFile, $modalInstance) {

		// start loading the image file immediately.
		var fileReader = new FileReader(),
			self = this;

		self.imageAsDataUri = null;

		fileReader.onload = function(event) {
			self.imageAsDataUri = event.target.result;
		};

		fileReader.readAsDataURL(imageFile);

		// TODO: cancel upload, do image preview, display loading indicator as image is uploading
		// TODO: do something about errors, css/formatting for modal, notify caller of image URL.
		this.doUpload = function() {
			imageUpload.doSingleImageUpload(self.imageAsDataUri.split(',')[1]);
		};
	})

	.directive('bunkerDropzone', function($document, imageUpload, $modal) {
		return {
			restrict: 'A',
			link: function(scope, element) {

				/* There's gotta be a better way to do this */
				element
					.append('<div id="bunkerDropzoneOverlay">drop images here!</div>');

				element
					.on('dragover', function(e) {
						e.preventDefault();
					})
					.on('dragbetterenter', function(e) {
						$(this).addClass('dragover');
					})
					.on('dragbetterleave', function(e) {
						$(this).removeClass('dragover');
					})
					.on('drop', function(e) {
						e.preventDefault();


						var files = e.originalEvent.dataTransfer.files,
							file = files.length ? files[0] : null;

						if (!file) {return;}

						$modal.open({
							templateUrl: '/assets/app/room/fileEvents/imageUpload.html',
							controller: 'ImageUpload as imageUpload',
							resolve: {
								imageFile: function() {
									return file;
								}
							}
						});

						// TODO: send final URL to message directive.


					});


				// we listen on doc element also to swallow "missed" drops.
				$document
					.on('dragover', function(e) {
						e.preventDefault();
					})
					.on('drop', function(e) {
						e.preventDefault();
					});
			}
		};
	});


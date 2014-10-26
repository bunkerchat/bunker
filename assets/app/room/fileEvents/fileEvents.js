angular
	.module('fileEvents', [])

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

	.directive('dropzone', function($document, imageUpload) {
		return {
			restrict: 'A',
			link: function(scope, element) {
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

						// TODO: open modal to do upload.
						// TODO: send final URL to message directive.

						var files = e.originalEvent.dataTransfer.files,
							file = files.length ? files[0] : null;

						if (!file) { return; }

						var fileReader = new FileReader();

						fileReader.onload = function(event) {
							var finalImg = event.target.result.split(',')[1];

							imageUpload.doSingleImageUpload(finalImg);
						};

						fileReader.readAsDataURL(file);
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


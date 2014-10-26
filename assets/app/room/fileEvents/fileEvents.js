angular
	.module('fileEvents', [])

	.factory('imageUpload', function ($http) {

		return {
			doUpload: function (base64ImageData, progress) {

				var xmlHttpRequest = new XMLHttpRequest();
				xmlHttpRequest.open('POST', 'https://api.imgur.com/3/image');

				xmlHttpRequest.setRequestHeader('Authorization', 'Client-ID ' + 'f9b49a92d8ec31b');
				xmlHttpRequest.setRequestHeader('Accept', 'application/json');

				xmlHttpRequest.onload = function (e) {
					$('#finalImage').val(JSON.parse(e.target.responseText).data.link);
				};

				xmlHttpRequest.onerror = function (e) {
					debugger;
				};

				var formData = new FormData();
				formData.append('type', 'base64');
				formData.append('image', base64ImageData);

				xmlHttpRequest.send(formData);

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

	});


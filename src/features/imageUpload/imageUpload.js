export default {

	doSingleImageUpload: function(base64ImageData, progress) {

		return new Promise(function(resolve, reject) {
			var xmlHttpRequest = new XMLHttpRequest();
			xmlHttpRequest.open("POST", "https://api.imgur.com/3/image");

			xmlHttpRequest.setRequestHeader("Authorization", "Client-ID f9b49a92d8ec31b");
			xmlHttpRequest.setRequestHeader("Accept", "application/json");

			xmlHttpRequest.onload = function(e) {
				// right now just resolving the image link... might need to send more.
				var responseObj = JSON.parse(e.target.responseText);
				if (!responseObj.data || !responseObj.data.link) {
					reject();
				}
				else {
					resolve(responseObj.data.link);
				}
			};

			xmlHttpRequest.onerror = reject;

			if (xmlHttpRequest.upload && progress) {
				xmlHttpRequest.upload.addEventListener("progress", function(progressEvent) {
					if (progressEvent.lengthComputable) {
						progress(progressEvent.loaded / progressEvent.total * 100);
					}
				}, false);
			}

			var formData = new FormData();
			formData.append("type", "base64");
			formData.append("image", base64ImageData);

			xmlHttpRequest.send(formData);
		});
	}
};

function isImageUri(uri) {
	return /\.(gif|png|jpg|jpeg)$/i.test(uri);
}

function isFile(item) {
	return item instanceof File || item instanceof Blob;
}

function isImageFile(item) {
	// TODO: can probably change this to just be a regex: /image.*/
	return item.type && (
		_.includes(item.type, "/jpeg") ||
		_.includes(item.type, "/jpg") ||
		_.includes(item.type, "/gif") ||
		_.includes(item.type, "/bmp") ||
		_.includes(item.type, "/png"));
}

function getFileError(file) {
	if (!isImageFile(file)) {
		return "Unsupported file type.  Only images are supported.";
	}
	else if (file.size > 4 * 1024 * 1024) {
		return "The file is too large! Files can be a maximum of 4MB.";
	}

	return null;
}

export default {

	// returns a promise which is rejected if the file is an invalid image, and resolves if the image is
	// successfully read in to memory.
	loadImage: function(item) {

		return new Promise(function(resolve, reject) {

			if (isFile(item)) {

				const fileError = getFileError(item);

				if (fileError) {
					reject({ error: fileError });
					return;
				}

				const fileReader = new FileReader();
				fileReader.onload = function(event) {
					const loadedData = event.target.result;
					resolve({ data: loadedData });
				};

				fileReader.onerror = function(event) {
					reject(event);
				};

				fileReader.readAsDataURL(item);
			}
			else {
				item.getAsString(function(imageUri) {
					if (!self.isImageUri(imageUri)) {
						reject({ error: "Unsupported file type. Only images are supported." });
					}
					else {
						resolve({ data: imageUri });
					}
				});
			}
		});
	}
};

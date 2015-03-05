// Currently only handles image files and URI DataTransferItem
app.factory('DroppableItem', function ($q) {

	return function (item) {

		var self = this,
			loadedData = null,
			unsupportedFileTypeError = 'Unsupported file type.  Only images are supported.';

		self.isFile = function () {
			return item instanceof File || item instanceof Blob;
		};

		self.isImageUri = function (uri) {
			return /\.(gif|png|jpg|jpeg)$/i.test(uri);
		};

		self.isImageFile = function (item) {
			// TODO: can probably change this to just be a regex: /image.*/
			return item.type && (
				_.contains(item.type, '/jpeg') ||
				_.contains(item.type, '/jpg') ||
				_.contains(item.type, '/gif') ||
				_.contains(item.type, '/bmp') ||
				_.contains(item.type, '/png'));
		};

		var getFileError = function (file) {
			if (!self.isImageFile(file)) {
				return unsupportedFileTypeError;
			}
			else if (file.size > 4 * 1024 * 1024) {
				return 'The file is too large! Files can be a maximum of 4MB.';
			}

			return null;
		};

		// returns a promise which is rejected if the item is invalid, and resolves if the
		// data is successfully loaded.
		this.loadData = function () {

			return $q(function (resolve, reject) {

				if (loadedData) {
					resolve({droppable: self, data: loadedData});
				}

				var fileError;

				if (self.isFile()) {

					fileError = getFileError(item);

					if (fileError) {
						reject({error: fileError});
						return;
					}

					var fileReader = new FileReader();
					fileReader.onload = function (event) {
						loadedData = event.target.result;
						resolve({droppable: self, data: loadedData});
					};

					fileReader.readAsDataURL(item);
				}
				else {
					item.getAsString(function (imageUri) {
						if (!self.isImageUri(imageUri)) {
							reject({error: unsupportedFileTypeError});
						}
						else {
							loadedData = imageUri;
							resolve({droppable: self, data: imageUri});
						}
					});
				}
			});
		};

		return this;
	};
});

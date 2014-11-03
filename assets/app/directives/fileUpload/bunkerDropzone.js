app.directive('bunkerDropzone', function ($document, $compile) {

	return {
		restrict: 'A',
		scope: true,

		controller: function ($modal, $rootScope, imageUpload) {

			var self = this;

			self.isModalOpen = false;

			this.doSingleImageUpload = function (file) {
				var error = null;

				// this could probably be more generic to support more file types
				if (!self.isImageFile(file)) {
					error = 'Unsupported file type.  Only images are supported.';
				}
				else if (file.size > 4 * 1024 * 1024) {
					error = 'The file is too large! Files can be a maximum of 4MB.';
				}

				self.isModalOpen = true;

				if (error) {
					$modal.open({
						templateUrl: '/assets/app/directives/fileUpload/fileError.html',
						controller: 'FileError as fileError',
						resolve: {
							errorMessage: function () {
								return error;
							}
						}
					})
						.result
						.then(self.setModalClosed, self.setModalClosed);
				}
				else {
					$modal.open({
						templateUrl: '/assets/app/directives/fileUpload/imageUpload.html',
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
							self.setModalClosed();
							$rootScope.$broadcast('inputText', url);
						}, self.setModalClosed);
				}
			};

			this.isImageFile = function (item) {
				// TODO: can probably change this to just be a regex: /image.*/
				return item.type && (
					_.contains(item.type, '/jpeg') ||
					_.contains(item.type, '/jpg') ||
					_.contains(item.type, '/gif') ||
					_.contains(item.type, '/png'));
			};

			this.setModalClosed = function () {
				self.isModalOpen = false;
			};
		},

		controllerAs: 'dropzoneCtrl',

		link: function (scope, element, attrs, dropzoneCtrl) {

			/* There's gotta be a better way to do this */
			var overlay = angular.element('<div id="bunker-dropzone-overlay"><div class="overlay"></div><div overlay-contents></div></div>');
			element
				.append(overlay);
			$compile(overlay)(scope);

			/* listen for main drag/drop events */
			element
				.on('dragover.dropzone', function (e) {
					e.preventDefault(); // this must be here otherwise the browser won't listen for the drop event.
				})
				.on('dragbetterenter.dropzone', function () {
					if (!dropzoneCtrl.isModalOpen) {
						$(this).addClass('dragover');
					}
				})
				.on('dragbetterleave.dropzone', function () {
					$(this).removeClass('dragover');
				})
				.on('drop.dropzone', function (e) {

					e.preventDefault();

					if (dropzoneCtrl.isModalOpen) {
						return;
					}

					var files = e.originalEvent.dataTransfer.files,
						file = files.length ? files[0] : null;

					if (!file) {
						return;
					}

					dropzoneCtrl.doSingleImageUpload(file);
				});

			/* we listen on doc element also to swallow "missed" drops.
			 also listening for paste event */
			$document
				.on('dragover.dropzone drop.dropzone', function (e) {
					e.preventDefault();
				})
				.on('paste.dropzone', function (e) {

					if (!e.originalEvent.clipboardData || dropzoneCtrl.isModalOpen) {
						return;
					}

					var copiedImage = _.find(e.originalEvent.clipboardData.items, function (item) {
						return dropzoneCtrl.isImageFile(item);
					});

					if (!copiedImage) {
						return;
					}

					e.preventDefault();
					dropzoneCtrl.doSingleImageUpload(copiedImage.getAsFile());
				});

			scope.$on('$destroy', function () {
				element.off('.dropzone');
				$document.off('.dropzone');
			});
		}
	};
});
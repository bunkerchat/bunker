app.directive('bunkerDropzone', function ($document, $compile, DroppableItem) {

	// Takes raw DOM events and translates them in to our DroppableItem model.
	// returns falsy if we can't find a valid item to turn in to a droppable.
	var getDroppableItem = function (event) {

		var dataTransfer = event.originalEvent.dataTransfer,
			rawItem;

		if (!dataTransfer) {
			return null;
		}

		// Here is how to get a FF -> FF or Chrome -> FF image drag to work:
		// dataTransfer.mozItemCount
		// dataTransfer.mozGetDataAt('text/x-moz-url', 0)

		// if dragging a file from within a browser window
		if (dataTransfer.items && dataTransfer.items.length) {
			rawItem = _.find(dataTransfer.items, function (i) {
				return i.type === "text/uri-list";
			});

			if (rawItem) {
				return new DroppableItem(rawItem);
			}
		}

		// If dragging a file from outside the browser window (desktop)
		if (dataTransfer.files && dataTransfer.files.length) {
			return new DroppableItem(dataTransfer.files[0]);
		}

		return null;
	};

	return {
		restrict: 'A',
		scope: true,

		controller: function ($modal, $rootScope, imageUpload) {

			var self = this;

			self.isModalOpen = false;

			self.doSingleImageUpload = function (droppableItem) {

				droppableItem.loadData().then(function (loadedData) {

					if (loadedData.droppable.isFile()) {
						self.isModalOpen = true;

						$modal.open({
							templateUrl: '/assets/app/fileUpload/imageUpload.html',
							controller: 'ImageUpload as imageUpload',
							resolve: {
								imageData: function () {
									return loadedData.data;
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
					else {
						$rootScope.$broadcast('inputText', loadedData.data);
					}

				}, function (errorObj) {
					$modal.open({
						templateUrl: '/assets/app/fileUpload/fileError.html',
						controller: 'FileError as fileError',
						resolve: {
							errorMessage: function () {
								return errorObj.error;
							}
						}
					})
						.result
						.then(self.setModalClosed, self.setModalClosed);
				});
			};

			self.isImageFile = function (item) {
				// TODO: can probably change this to just be a regex: /image.*/
				return item.type && (
					_.includes(item.type, '/jpeg') ||
					_.includes(item.type, '/jpg') ||
					_.includes(item.type, '/gif') ||
					_.includes(item.type, '/bmp') ||
					_.includes(item.type, '/png'));
			};

			self.setModalClosed = function () {
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
					// We should be doing a check here to make sure it's valid. To fix when fixing the FF
					// bug. 'dragbetterenter' doesn't propagate the dragenter event properly :( /* && getDroppableItem(e) */
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

					var droppableItem = getDroppableItem(e);

					if (!droppableItem) {
						return;
					}

					dropzoneCtrl.doSingleImageUpload(droppableItem);
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
					dropzoneCtrl.doSingleImageUpload(new DroppableItem(copiedImage.getAsFile()));
				});

			scope.$on('$destroy', function () {
				element.off('.dropzone');
				$document.off('.dropzone');
			});
		}
	};
});

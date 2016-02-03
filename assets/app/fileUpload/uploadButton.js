app.directive('uploadButton', function ($timeout, imageUpload, DroppableItem, $rootScope) {
	return {
		template: `
		<span class="btn btn-file btn-success">
			<i ng-if="uploading" class="fa fa-spinner fa-spin fa-align-center"></i>
			<i ng-if="!uploading" class="fa fa-cloud-upload fa-align-center"></i>
			<input type="file" name="pic" accept="image/*">
			</span>
		`,
		link: function ($scope, $elem) {
			$timeout(function () {
				$('span.btn-file input[type="file"]').on('change', handleFileSelect);
			});

			function handleFileSelect(evt) {
				var file = _.first(evt.target.files);
				var droppable = new DroppableItem(file);

				droppable.loadData()
					.then(loadedData => {
						$scope.uploading = true;
						return imageUpload.doSingleImageUpload(loadedData.data.split(',')[1])
					})
					.then(url  => {
						$scope.uploading = false;
						$rootScope.$broadcast('inputText', url)
					})
			}
		}
	}
});

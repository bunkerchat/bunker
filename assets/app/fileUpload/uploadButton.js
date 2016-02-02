app.directive('uploadButton', function ($timeout, imageUpload, DroppableItem, $rootScope) {
	return {
		template: `
		<span class="btn btn-file btn-success">
				<i class="fa fa-cloud-upload"></i>
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
					.then(loadedData => imageUpload.doSingleImageUpload(loadedData.data.split(',')[1]))
					.then(url  => $rootScope.$broadcast('inputText', url))
			}
		}
	}
});

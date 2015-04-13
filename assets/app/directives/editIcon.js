app.directive('editIcon', function ($timeout) {

	var editWindowMilliseconds = 60000;

	function isEditable(message) {
		return moment().diff(message.createdAt) < editWindowMilliseconds;
	}

	return {
		template: '<i class="fa fa-pencil" style="display: none;"></i>',
		scope: {
			message: '=editIcon'
		},
		link: function ($scope, $element) {

			var listener = $scope.$watch('message', function (message) {
				if (message.edited) {
					angular.element($element).find('i').show();
					listener(); //  kill watch
				}
				else if (!isEditable(message)) {
					listener();
				}
				else {
					$timeout(listener, editWindowMilliseconds - moment().diff(message.createdAt));
				}
			}, true);
		}
	};
});

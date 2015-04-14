app.directive('editIcon', function ($timeout) {

	var editWindowMilliseconds = 60000;

	return {
		scope: {
			message: '=editIcon'
		},
		link: function ($scope, $element) {

			var listener = $scope.$watch('message.edited', function (edited) {
				if(edited) {
					angular.element($element).append('<i class="fa fa-pencil"></i>');
				}
			});

			$timeout(listener, editWindowMilliseconds - moment().diff($scope.message.createdAt));
		}
	};
});

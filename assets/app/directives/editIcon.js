app.directive('editIcon', function ($timeout, bunkerConstants) {
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

			$timeout(listener, bunkerConstants.editWindowMilliseconds - moment().diff($scope.message.createdAt));
		}
	};
});

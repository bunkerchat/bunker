app.directive('status', function ($timeout) {
	return {
		restrict: "EA",
		scope: {
			user: "="
		},
		templateUrl: "/assets/app/shared/status.html",
		link: function ($scope) {
			var self = this;

			$scope.$on($scope.user.id, function(event, user){
				checkAway(user);
			});

			function checkAway(user){
				$scope.away = moment().diff(moment(user.lastActivity), "seconds") > 5;
			};


			checkAway($scope.user);
		}
	};
});
app.directive('status', function ($timeout) {
	return {
		restrict: "EA",
		scope: {
			user: "="
		},
		templateUrl: "/assets/app/shared/status.html",
		link: function ($scope) {
			//Sorry josh, had to make it a function for it to pick up my messages updates.
			$scope.away = _.throttle(function(){
				console.count('away derp')
				return moment().diff(moment($scope.user.lastActivity), "minutes") > 5;
			},2000);
		}
	};
});

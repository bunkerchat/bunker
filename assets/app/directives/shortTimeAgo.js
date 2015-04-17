app.directive('shortTimeAgo', function ($interval) {
	return {
		scope: {
			date: '@shortTimeAgo'
		},
		link: function ($scope, element) {

			function shortTime() {
				angular.element(element).html(moment($scope.date).fromNow(true)
					.replace(/\b([smhdwmy])[a-z]+\b/, '$1')
					.replace('a', '1')
					.replace('few', '')
					.replace(/\s/g, ''));
			}

			$interval(shortTime, 30000); // TODO make this slower if really old
			shortTime();
		}
	};
});

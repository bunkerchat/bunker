app.directive('fill', function ($window, $timeout) {
	return {
		restrict: 'AC',
		link: function (scope, elem, attrs) {
			var options = scope.$eval(attrs.fill);
			var windowEl = angular.element($window);
			var el = angular.element(elem);
			var marginBottom = options.marginBottom || 0;

			windowEl.resize(function () {
				if($window.innerWidth <= 480) {
					el.css({
						height: 'auto'
					});
				}
				else {
					var fillHeight = $window.innerHeight - el.offset().top - marginBottom - 2;
					el.css({
						height: fillHeight + 'px',
						margin: 0
					});
				}
			});
			$timeout(function () {
				windowEl.resize();
			}, 500);
		}
	};
});

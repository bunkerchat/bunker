app.directive('fill', function ($window, $timeout) {
	return {
		restrict: 'AC',
		link: function (scope, elem) {

			function resize(time) {
				$timeout(function () {
					windowEl.resize();
				}, time || 0);
			}

			var windowEl = angular.element($window);
			var el = angular.element(elem);
			var marginBottom = 0;

			windowEl.resize(function () {

				marginBottom = angular.element('.message-input').height();

				if ($window.innerWidth <= 480) {
					el.removeAttr('style');
				}
				else {
					var fillHeight = Math.ceil($window.innerHeight - el.offset().top - marginBottom - 1);
					el.css({
						height: fillHeight + 'px',
						margin: 0
					});
				}
			});

			scope.$on('roomIdChanged', resize);
			resize(500);
		}
	};
});

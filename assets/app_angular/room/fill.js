app.directive('fill', function ($window, $timeout) {
	return {
		restrict: 'AC',
		link: function (scope, elem) {
			var windowEl = angular.element($window);
			var el = angular.element(elem);
			var marginBottom = 0;

			windowEl.resize(function () {

				marginBottom = angular.element('.message-input').height();

				if ($window.innerWidth <= 480) {
					el.css({
						height: 'auto'
					});
				}
				else {
					var fillHeight = Math.ceil($window.innerHeight - el.offset().top - marginBottom - 1);
					el.css({
						height: fillHeight + 'px',
						margin: 0
					});
				}
			});

			// Triggers
			// Initial
			$timeout(function () {
				windowEl.resize();
			}, 500);

			// Room updates
			scope.$on('roomIdChanged', function (evt, newId, oldId) {
				$timeout(function () {
					windowEl.resize();
				});
			});
		}
	};
});

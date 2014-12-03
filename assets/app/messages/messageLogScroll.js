app.directive('messageLogScroll', function ($timeout) {
	return {
		scope: {
			messageId: '@messageLogScroll',
			onScrollTop: '&'
		},
		link: function (scope, elem) {
			var el = elem[0];
			var tolerance = 31;

			// Scroll on message adds
			scope.$watch('messageId', function (messageId) {

				if (el.scrollTop + el.clientHeight + tolerance >= el.scrollHeight) { // We're at the bottom

					// Check for images
					var image = angular.element('#' + messageId).find('img');
					if (image.length) { // If we have an image, wait for it to load before scrolling
						image.load(function() { scroll(100); });
					} else { // Otherwise scroll immediately
						scroll();
					}
				}
			});

			// Watch scrolling to top, execute given function
			angular.element(el).bind('scroll', function() {
				if (el.scrollTop == 0 && angular.isFunction(scope.onScrollTop)) { // We're at the top
					scope.onScrollTop();
				}
			});

			// Scroll after state changes
			scope.$on('$stateChangeSuccess', function () {
				scroll(500);
			});

			function scroll(waitTime) {
				$timeout(function () {
					el.scrollTop = el.scrollHeight;
				}, waitTime || 0);
			}
		}
	};
});

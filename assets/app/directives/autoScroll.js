app.directive('autoScroll', function ($location, $timeout) {
	return {
		scope: {
			messageId: '@autoScroll'
		},
		link: function (scope, elem) {
			var el = angular.element(elem);
			var firstTime = true;

			scope.$watch(function() { return $location.search()}, function() {
				$timeout(scroll, 500);
			});
			scope.$watch('messageId', function (messageId, lastMessageId) {
				if (messageId == lastMessageId) return;

				var currentScroll = el.prop('scrollHeight') - el.prop('scrollTop');
				var shouldScroll = currentScroll <= el.height() + 25;
				if (!shouldScroll) return;

				if(firstTime) {
					$timeout(scroll, 500);
					firstTime = false;
					return;
				}

				$timeout(function () {
					var image = angular.element('#' + messageId).find('img');

					if (image.length) {
						image.on('load', scroll);
					} else {
						scroll();
					}
				});
			});

			function scroll() {
				el.scrollTop(el.prop('scrollHeight'));
			}
		}
	};
});

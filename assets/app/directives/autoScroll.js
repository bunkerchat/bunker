app.directive('autoScroll', function ($location, $anchorScroll, $timeout) {
	return {
		scope: {
			messageId: '@autoScroll'
		},
		link: function (scope, elem) {
			var el = angular.element(elem);
			var firstTime = true;
			scope.$watch('messageId', function (messageId, lastMessageId) {
				if (messageId == lastMessageId) return;

				// TODO why does height need a 1px tolerance?
				var currentScroll = el.prop('scrollHeight') - el.prop('scrollTop');
				var shouldScroll = currentScroll == el.height() || currentScroll == el.height() + 1;
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

				function scroll() {
					$location.hash(messageId);
					$anchorScroll();
				}
			});
		}
	};
});

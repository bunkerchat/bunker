app.directive('autoScroll', function ($location, $anchorScroll, $timeout) {
	return {
		scope: {
			messageId: '@autoScroll'
		},
		link: function (scope, elem) {
			var el = angular.element(elem);
			var firstTime = true;
			scope.$watch('messageId', function (newVal, oldVal) {
				if(newVal == oldVal) return;

				// TODO why does height need a 1px tolerance?
				var currentScroll = el.prop('scrollHeight') - el.prop('scrollTop');
				if(currentScroll == el.height() || currentScroll == el.height() + 1) {
						// scroll to message
						$timeout(function() {
							$location.hash(newVal);
							$anchorScroll();
						},firstTime ? 500 : 0);

					firstTime = false;
				}
			});
		}};
});

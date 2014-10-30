app.directive('autoScroll', function ($timeout) {
	return {
		scope: {
			watching: '@autoScroll'
		},
		link: function (scope, elem) {
			var el = angular.element(elem);
			var firstTime = true;
			scope.$watch('watching', function () {
				// TODO why does height need a 1px tolerance?
				var currentScroll = el.prop('scrollHeight') - el.prop('scrollTop');
				if(firstTime || currentScroll == el.height() || currentScroll == el.height() + 1) {
					$timeout(function () {
						el.scrollTop(el.prop('scrollHeight'));
					}, firstTime ? 500 : 0);
					firstTime = false;
				}
			});
		}};
});

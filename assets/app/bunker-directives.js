app.directive('fill', function ($window, $timeout) {
	return {
		restrict: 'AC',
		scope: {
			marginBottom: '='
		},
		link: function (scope, elem) {
			var windowEl = angular.element($window);
			var el = angular.element(elem);
			var marginBottom = scope.marginBottom || 0;

			windowEl.resize(function () {
				var fillHeight = $window.innerHeight - el.offset().top - marginBottom - 1;
				el.css({
					height: fillHeight + 'px',
					margin: 0
				});
			});
			$timeout(function () {
				windowEl.resize();
			}, 500);
		}
	}
});
app.directive('autoScroll', function () {
	return function (scope, elem) {
		var el = angular.element(elem);
		scope.$watch(function () {
			return el.children().length;
		}, function () {
			el.scrollTop(el.prop('scrollHeight'));
		});
	};
});
app.directive('bunkerMessage', function ($sce, emoticons) {
	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			text: '@bunkerMessage'
		},
		link: function (scope) {
			scope.$watch('text', function (text) {
				var formatted = text; // Start with text

				// Parse emoticons
				var emoticonTexts = /:\w+:/.exec(formatted);
				angular.forEach(emoticonTexts, function(emoticonText) {
					var knownEmoticon = _.find(emoticons, function(known) { return known.replace(/.\w+$/, '') == emoticonText.replace(/:/g, '');});
					if(knownEmoticon) {
						formatted = formatted.replace(emoticonText, '<img class="emoticon" src="/images/emoticons/' + knownEmoticon + '"/>');
					}
				});

				scope.formatted = $sce.trustAsHtml(formatted);
			});
		}
	}
});
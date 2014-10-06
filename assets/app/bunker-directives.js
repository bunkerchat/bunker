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
app.directive('autoScroll', function ($timeout) {
	return function (scope, elem) {
		var el = angular.element(elem);
		scope.$watch(function () {
			return el.children().length;
		}, function () {
			$timeout(function () {
				el.scrollTop(el.prop('scrollHeight'));
			});
		});
	};
});
app.directive('bunkerMessage', function (emoticons) {
	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			text: '@bunkerMessage'
		},
		link: function (scope) {
			scope.$watch('text', function (text) {
				var formatted = text;

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return known.replace(/.\w+$/, '') == emoticonText.replace(/:/g, '');
					});
					if (knownEmoticon) {
						formatted = formatted.replace(emoticonText, '<img class="emoticon" src="/images/emoticons/' + knownEmoticon + '"/>');
					}
				});

				scope.formatted = formatted;
			});
		}
	};
});
app.directive('unreadMessages', function ($rootScope, $window) {
	return function (scope, elem) {
		var el = angular.element(elem);
		var win = angular.element($window);

		var original = el.text();
		var unreadMessages = 0;
		var hasFocus = true;

		win.bind('focus', function () {
			hasFocus = true;
			unreadMessages = 0;
			el.text(original);
		});
		win.bind('blur', function () {
			hasFocus = false;
		});

		$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
			if (!hasFocus && resource.model == 'room' && resource.data.author) {
				unreadMessages++;
				el.text('(' + unreadMessages + ') ' + original);
			}
		});
	};
});

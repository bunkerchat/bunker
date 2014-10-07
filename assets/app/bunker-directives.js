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
app.directive('bunkerMessage', function ($compile, emoticons) {
	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			text: '@bunkerMessage'
		},
		link: function (scope, elem) {
			scope.$watch('text', function (text) {
				var formatted = text,
					replacedEmotes = {},
					replacedLinks = {};

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return known.replace(/.\w+$/, '') == emoticonText.replace(/:/g, '');
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
						formatted = formatted.replace(new RegExp(emoticonText, 'g'), '<img class="emoticon" title="'+emoticonText+'" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
						replacedEmotes[knownEmoticon] = true;
					}
				});

				// Parse links
				var attachedImage;
				_.each(text.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi), function (link) {
					if(/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedImage) {
						// Image link
						attachedImage = angular.element('<div bunker-message-image="' + link + '"></div>');
					}

					if(!replacedLinks[link]) {
						formatted = formatted.replace(new RegExp(link, 'g'), '<a href="' + link + '" target="_blank">' + link + '</a>');
						replacedLinks[link] = true;
					}
				});

				// If we made an image, attach it now
				if(attachedImage) {
					angular.element(elem).append(attachedImage);
					$compile(attachedImage)(scope.$new());
				}

				scope.formatted = formatted;
			});
		}
	};
});
app.directive('bunkerMessageImage', function() {
	return {
		templateUrl: '/assets/app/room/bunker-message-image.html',
		scope: {
			link: '@bunkerMessageImage'
		},
		link: function(scope) {
			scope.visible = true;
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

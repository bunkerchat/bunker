app.directive('bunkerMessage', function ($compile, emoticons) {

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

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

				// Parse bold
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(\*[A-Za-z0-9\s]+\*)(?:[^A-Za-z0-9]|$)/g), function (bold) {
					formatted = replaceAll(formatted, bold, '<strong>' + bold.replace(/\*/g, '') + '</strong>');
				});

				// Parse italics
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(_[A-Za-z0-9\s]+_)(?:[^A-Za-z0-9]|$)/g), function (italics) {
					formatted = replaceAll(formatted, italics, '<em>' + italics.replace(/_/g, '') + '</em>');
				});

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return new RegExp(known.replace(/\.\w{1,4}$/, '') + '$', 'i').test(emoticonText.replace(/:/g, ''));
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
						formatted = replaceAll(formatted, emoticonText,
								'<img class="emoticon" title="' + emoticonText + '" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
						replacedEmotes[knownEmoticon] = true;
					}
				});

				// Parse links
				var attachedImage;
				_.each(text.match(/https?:\/\/\S+/gi), function (link) {
					if (/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedImage) {
						// Image link
						attachedImage = angular.element('<div bunker-message-image="' + link + '"></div>');
					}

					if (!replacedLinks[link]) {
						formatted = replaceAll(formatted, link, '<a href="' + link + '" target="_blank">' + link + '</a>');
						replacedLinks[link] = true;
					}
				});

				// If we made an image, attach it now
				if (attachedImage) {
					angular.element(elem).append(attachedImage);
					$compile(attachedImage)(scope.$new());
				}

				scope.formatted = formatted;
			});
		}
	};
});
app.directive('bunkerMessageImage', function () {
	return {
		templateUrl: '/assets/app/room/bunker-message-image.html',
		scope: {
			link: '@bunkerMessageImage'
		},
		link: function (scope) {
			scope.visible = true;
		}
	};
});
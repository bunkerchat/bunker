/* global app, _ */

app.directive('bunkerMessage', function ($compile, emoticons) {
	'use strict';

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			bunkerMessage: '=',
			media: '@'
		},
		link: function (scope, elem) {

			// since we are passing in a bunker message OR room, run the watch on the room topic
			scope.$watch('bunkerMessage.text', textWatch);
			scope.$watch('bunkerMessage.topic', textWatch);

			function textWatch(text) {
				if (!text) return;

				// Parse quotes
				if (text.match(/\n[^$]/g)) {
					text = createQuotedBlock(text);
				}
				else {
					text = parseBoldAndItalics(text);
					text = parseEmoticons(text);
					text = parseMedia(text);
				}

				scope.formatted = text;
			}

			function createQuotedBlock(text) {
				// Scan for overtabs
				var lines = text.split('\n');
				var firstLineSpacingMatch = _.first(lines).match(/^(\s+)/);

				// If we have some spacing on the first line, remove the same spacing from all other lines (detabs everything)
				if (firstLineSpacingMatch) {
					var firstLineSpacingExpression = new RegExp('^' + firstLineSpacingMatch[1] + '');
					var spacingRemoved = _.map(lines, function (line) {
						return line.replace(firstLineSpacingExpression, '');
					});
					text = spacingRemoved.join('\n');
				}

				var attachedMedia = angular.element('<div message="bunkerMessage" bunker-media><pre>' + text + '</pre></div>');
				angular.element(elem).append(attachedMedia);
				$compile(attachedMedia)(scope.$new());

				return '';
			}

			function parseEmoticons(text) {
				var replacedEmotes = {};

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return known.replace(/\.\w{1,4}$/, '').toLowerCase() == emoticonText.replace(/:/g, '').toLowerCase();
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
						text = replaceAll(text, emoticonText,
							'<img class="emoticon" title="' + emoticonText + '" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
						replacedEmotes[knownEmoticon] = true;
					}
				});
				return text;
			}

			function parseBoldAndItalics(text) {
				// Parse bold
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(\*[^\*]+\*)(?:[^A-Za-z0-9]|$)/g), function (bold) {
					text = replaceAll(text, bold, '<strong>' + bold.replace(/\*/g, '') + '</strong>');
				});

				// Parse italics
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(_[^_]+_)(?:[^A-Za-z0-9]|$)/g), function (italics) {
					text = replaceAll(text, italics, '<em>' + italics.replace(/_/g, '') + '</em>');
				});

				return text;
			}

			function parseMedia(text) {
				var shouldParseMedia = typeof scope.media !== 'undefined' ? scope.$eval(scope.media) : true;
				var replacedLinks = {};

				// Parse links
				var attachedMedia;
				_.each(text.match(/https?:\/\/\S+/gi), function (link) {

					// Only parse media (images, youtube) if asked to
					if (shouldParseMedia) {
						if (/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedMedia) {
							// Image link
							attachedMedia = angular.element('<div message="bunkerMessage" bunker-media="' + link + '"><img src="' + link + '"/></div>');
						}
						else if (/\.(gifv|mp4)$/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
							'<div bunker-media="' + link + '">' +
							'<video autoplay loop muted><source type="video/mp4" src="' + link.toLowerCase().replace('gifv', 'mp4') + '"></video>' +
							'</div>');
						}
						else if (/(www\.)?(youtube\.com|youtu\.?be)\/watch/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
							'<div class="default-video-height" message="bunkerMessage" bunker-media="' + link + '">' +
							'<youtube-video player-width="\'100%\'" player-height="\'100%\'" video-url="\'' + link + '\'"></youtube-video>' +
							'</div>');
						}
					}

					if (!replacedLinks[link]) {
						text = replaceAll(text, link, '<a href="' + link + '" target="_blank">' + link + '</a>');
						replacedLinks[link] = true;
					}
				});

				// If we made an image, attach it now
				if (attachedMedia) {
					angular.element(elem).append(attachedMedia);
					$compile(attachedMedia)(scope.$new());
				}

				return text;
			}
		}
	};
});

/* global app, _ */

// callback from twitter to embed tweet html
window.addTweet = function (data) {
	var id = data.url.substr(data.url.lastIndexOf('/') + 1);
	var element = $('.tweet_' + id);
	element.empty();
	element.append(data.html);
};

app.filter('trusted', ['$sce', function ($sce) {
	return function (url) {
		return $sce.trustAsResourceUrl(url);
	};
}]);

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
				if (text.match(/&#10;/g)) {

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
				var lines = text.split('&#10;');
				var firstLineSpacingMatch = _.first(lines).match(/^((&#9;)*)/);

				// If we have some spacing on the first line, remove the same spacing from all other lines (detabs everything)
				if (firstLineSpacingMatch) {
					var firstLineSpacingExpression = new RegExp('^' + firstLineSpacingMatch[1] + '');
					var spacingRemoved = _.map(lines, function (line) {
						return line.replace(firstLineSpacingExpression, '');
					});
					text = spacingRemoved.join('&#10;');
				}

				var attachedMedia = angular.element('<div message="bunkerMessage" bunker-media><div hljs no-escape>' + text + '</div></div>');
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
				// bold
				text = text.replace(/\*(.+?)\*/g,'<strong>$1</strong>');

				// italics
				text = text.replace(/\_(.+?)\_/g,'<em>$1</em>');

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
						else if (/imgur.com\/\w*\.(gifv|webm|mp4)$/i.test(link) && !attachedMedia) {
							var imgurLinkMpeg = link.replace('webm', 'mp4').replace('gifv', 'mp4');
							var imgurLinkWebm = link.replace('mp4', 'webm').replace('gifv', 'webm');
							attachedMedia = angular.element('' +
							'<div message="bunkerMessage" bunker-media="' + link + '"><video class="imgur-gifv" preload="auto" autoplay muted webkit-playsinline loop><source type="video/webm" src="' + imgurLinkWebm +'"><source type="video/mp4" src="' + imgurLinkMpeg + '"></video>' +
							'</div>');
						}
						else if (/\.(gifv|mp4|webm)$/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
							'<div message="bunkerMessage" bunker-media="' + link + '">' +
							'<video autoplay loop muted><source type="video/mp4" src="' + link.toLowerCase().replace('gifv', 'mp4') + '"></video>' +
							'</div>');
						}
						else if (/(www\.)?(youtube\.com|youtu\.?be)\/watch/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
							'<div class="default-video-height" message="bunkerMessage" bunker-media="' + link + '">' +
							'<youtube-video video-url="\'' + link + '\'"></youtube-video>' +
							'</div>');
						}
						else if (/(www\.)?(twitter\.com\/)/i.test(link) && !attachedMedia) {
							var id = link.substr(link.lastIndexOf('/') + 1);
							if (id) { /* don't embed tweet if we can't get the id from the link */
								attachedMedia = angular.element('' +
								'<div message="bunkerMessage" bunker-media="' + link + '">' +
								'<div class="tweet_' + id + '">' +
								'<script src="https://api.twitter.com/1/statuses/oembed.json?id=' + id + '&amp;callback=addTweet&amp">' +
								'</script></div></div>');
							}
						}
						else if (/(www\.)?(soundcloud\.com\/[a-zA-Z0-9])/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
							'<div message="bunkerMessage" bunker-media="' + link + '">' +
							'<div plangular="' + link + '">' +
							'<iframe width="100%" height="166" scrolling="no" frameborder="no" ' +
							'src="{{ \'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/\' + id + \'&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false\' | trusted}}"></iframe>' +
							'</div></div>');
						}
						else if (/vimeo\.com(?:.*)?\/([A-z0-9]*)$/i.test(link) && !attachedMedia) {
							var match = /vimeo\.com(?:.*)?\/([a-zA-Z0-9]*)$/i.exec(link);
							attachedMedia = angular.element('' +
							'<div message="bunkerMessage" bunker-media="' + link + '">' +
							'<iframe src="https://player.vimeo.com/video/' + match[1] + '?title=0&byline=0&portrait=0" width="750" height="422" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
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

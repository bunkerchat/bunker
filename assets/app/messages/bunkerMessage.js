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

// jesus fucking christ why the god damn hell does regex have state!?
function youtubeRegexp(){
	return /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
}

app.directive('bunkerMessage', function ($compile, emoticons, bunkerData, bunkerConstants, $timeout) {

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

	return {
		template: '<span ng-bind-html="::formatted"></span>',
		scope: {
			bunkerMessage: '=',
			media: '@'
		},
		link: function (scope, elem) {

			// since we are passing in a bunker message OR room, run the bunkerText on the correct property
			if (scope.bunkerMessage && scope.bunkerMessage.text) {
				scope.formatted = parseText(scope.bunkerMessage.text);
			}
			else {
				scope.$watch('bunkerMessage.topic', function (topic) {
					elem.html(parseText(topic));
				});
			}

			function parseText(text) {
				if (!text) return;

				if (scope.bunkerMessage.type == 'code') {
					text = parseCode(text);
				}
				else if (scope.bunkerMessage.type == 'hangman') {
					text = parseHangman(text);
				}
				else if (scope.bunkerMessage.type == 'fight') {
					// fight message can have custom images as well as block text
					text = parseFight(text);
				}
				else if (text.match(/&#10;/g)) {  // unicode 10 is tabs/whitespace
					text = createQuotedBlock(text);
				}
				else {
					text = parseFormatting(text);
					if (bunkerData.userSettings.showEmoticons) {
						text = parseEmoticons(text);
					}
					text = parseMedia(text);
				}

				return text;
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

				if (scope.bunkerMessage.type == 'stats') {
					text = parseEmoticons(text);
				}

				var attachedMedia = angular.element('<div message="::bunkerMessage" bunker-media><pre>' + text + '</pre></div>');

				angular.element(elem).append(attachedMedia);
				$compile(attachedMedia)(scope.$new());

				return '';
			}

			function parseHangman(text) {
				text = parseEmoticons(text);
				var makeDictionaryLink = /\|(.*)\|/i.exec(text);
				if (makeDictionaryLink) {
					var word = makeDictionaryLink[1].split(' ').join('').toLowerCase();
					text = text.replace(/\|(.*)\|/i, '<a href="https://www.wordnik.com/words/' + word + '" target="_blank">$1</a>');
				}
				return text.replace(/:hangman(\d):/, '<img class="emoticon" src="/assets/images/hangman$1.png"/>');
			}

			function parseFight(text) {
				var match = /:([^0-9:]*):/.exec(text);

				while (match) {
					text = text.replace(/:([^0-9:]*):/, '<img class="emoticon" src="/assets/images/$1.png"/>');
					match = /:([^0-9:]*):/.exec(text);
				}

				// check for a fatality
				match = /:(\w*)*:/.exec(text);
				if (match) {
					var fatality = '<img class="fatality" src="/assets/images/fatalities/' + match[1] + '.gif"/>';
					text = text.replace(/:(\w*):/, '');
					text = "<div class=\"fight-message\">" + text + "</div>" + fatality;
				}
				if (text.match(/&#10;/g)) {  // unicode 10 is tabs/whitespace
					var attachedMedia = angular.element('<div message="::bunkerMessage" ><pre>' + text + '</pre></div>');
					angular.element(elem).append(attachedMedia);
					$compile(attachedMedia)(scope.$new());
					return '';
				}

				return text;
			}

			function parseCode(text) {
				var attachedMedia = angular.element('<div message="::bunkerMessage" bunker-media><div hljs no-escape>' + text + '</div></div>');
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

			function parseFormatting(text) {

				var types = [
					{marker: '*', tag: 'strong'},
					{marker: '_', tag: 'em'},
					{marker: '~', tag: 'del'},
					{marker: '|', tag: 'mark'}
				];

				_.each(types, function (type) {
					var lookup = new RegExp('(?:[^A-z0-9]|^)(\\' + type.marker + '[^\\' + type.marker + ']+\\' + type.marker + ')(?:[^A-z0-9]|$)', 'g');

					var match;
					while ((match = lookup.exec(text)) !== null) {
						text = replaceAll(text, match[0].trim(), '<' + type.tag + '>' + replaceAll(match[0], type.marker, '') + '</' + type.tag + '>');
					}
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
						if (/\.(gif|png|jpg|jpeg)/i.test(link) && !attachedMedia) {
							// Image link
							attachedMedia = angular.element('<div message="::bunkerMessage" bunker-media="' + link + '"><a target="_blank" href="' + link + '"><img src="' + link + '"/></a></div>');
						}
						else if (/imgur.com\/\w*\.(gifv|webm|mp4)$/i.test(link) && !attachedMedia) {
							var imgurLinkMpeg = link.replace('webm', 'mp4').replace('gifv', 'mp4');
							var imgurLinkWebm = link.replace('mp4', 'webm').replace('gifv', 'webm');
							attachedMedia = angular.element('' +
								'<div message="::bunkerMessage" bunker-media="' + link + '"><a target="_blank" href="' + link + '"><video class="imgur-gifv" preload="auto" autoplay muted webkit-playsinline loop><source type="video/webm" src="' + imgurLinkWebm + '"><source type="video/mp4" src="' + imgurLinkMpeg + '"></video>' +
								'</a></div>');
						}
						else if (/\.(gifv|mp4|webm)$/i.test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
								'<div message="::bunkerMessage" bunker-media="' + link + '">' +
								'<a target="_blank" href="' + link + '"><video autoplay loop muted><source type="video/mp4" src="' + link.toLowerCase().replace('gifv', 'mp4') + '"></video></a>' +
								'</div>');
						}
						else if (youtubeRegexp().test(link) && !attachedMedia) {
							attachedMedia = angular.element('' +
								'<div class="default-video-height" message="::bunkerMessage" bunker-media="' + link + '">' +
								'<youtube-video video-url="\'' + link + '\'"></youtube-video>' +
								'</div>');
						}
						else if (/(www\.)?(twitter\.com\/)/i.test(link) && !attachedMedia) {
							var id = link.substr(link.lastIndexOf('/') + 1);
							if (id) { /* don't embed tweet if we can't get the id from the link */
								attachedMedia = angular.element('' +
									'<div message="::bunkerMessage" bunker-media="' + link + '">' +
									'<div class="tweet_' + id + '">' +
									'<script src="https://api.twitter.com/1/statuses/oembed.json?id=' + id + '&amp;callback=addTweet&amp">' +
									'</script></div></div>');
							}
						}
						else if (/vimeo\.com(?:.*)?\/([A-z0-9]*)$/i.test(link) && !attachedMedia) {
							var match = /vimeo\.com(?:.*)?\/([a-zA-Z0-9]*)$/i.exec(link);
							attachedMedia = angular.element('' +
								'<div message="::bunkerMessage" bunker-media="' + link + '">' +
								'<iframe src="https://player.vimeo.com/video/' + match[1] + '?title=0&byline=0&portrait=0" width="750" height="422" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
								'</div>');
						}
						else if (/^https?:\/\/(?:play|open)\.spotify\.com\/(.*)/gi.test(link) && !attachedMedia) {
							var match = /^https?:\/\/(?:play|open)\.spotify\.com\/(.*)/gi.exec(link);
							var uri = "spotify%3A" + replaceAll(match[1],'/','%3A');

							attachedMedia = angular.element('' +
								'<div message="::bunkerMessage" bunker-media="' + link + '">' +
								'<iframe src="https://embed.spotify.com/?uri=' + uri + '" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>' +
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

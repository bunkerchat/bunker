/* global app, _ */

// callback from twitter to embed tweet html
window.addTweet = function (data) {
	var id = data.url.substr(data.url.lastIndexOf('/') + 1);
	var element = $('.tweet_' + id);
	element.empty();
	element.append(data.html);
};

// jesus fucking christ why the god damn hell does regex have state!?
function youtubeRegexp() {
	return /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
}

app.directive('bunkerMessage', function ($sce, $compile, emoticons, bunkerData) {

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

	return {
		template: `<span></span>`,
		scope: {
			bunkerMessage: '=',
			media: '@',
			small: '@'
		},
		link: function (scope, elem) {
			// since we are passing in a bunker message OR room, run the bunkerText on the correct property
			if (scope.bunkerMessage && scope.bunkerMessage.text) {
				elem.find('span').html(parseText(scope.bunkerMessage.text));
				$compile(elem.contents())(scope);
			}
			else {
				scope.$watch('bunkerMessage.topic', function (topic) {
					elem.html(parseText(topic));
					$compile(elem.contents())(scope);
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
					text = parseOther(text);
				}

				return text;
			}

			function parseOther(text) {
				var tokensSplitOnUrls = text.split(/(https?:\/\/\S+)/i); // split on urls
				var parsedTokens = _.map(tokensSplitOnUrls, token => {
					// Parse urls as media
					if (token.match(/https?:\/\/\S+/i)) {
						token = parseMedia(token);
					}
					else {
						token = parseFormatting(token);
						if (bunkerData.userSettings.showEmoticons) {
							token = parseEmoticons(token);
						}
					}
					return token;
				});

				return parsedTokens.join(' ');
			}

			function createQuotedBlock(text) {
				scope.bunkerMessage.type = 'quote';

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

				return `<div message="::bunkerMessage" bunker-quote><pre>${text}</pre></div>`;
			}

			function parseHangman(text) {
				text = parseEmoticons(text);
				var makeDictionaryLink = /\|(.*)\|/i.exec(text);
				if (makeDictionaryLink) {
					var word = makeDictionaryLink[1].split(' ').join('').toLowerCase();
					text = text.replace(/\|(.*)\|/i, `<a href="https://www.wordnik.com/words/${word}" target="_blank">$1</a>`);
				}
				return text.replace(/:hangman(\d):/, '<img class="emoticon" ng-src="/assets/images/hangman$1.png"/>');
			}

			function parseFight(text) {
				var match = /:([^0-9:]*):/.exec(text);

				while (match) {
					text = text.replace(/:([^0-9:]*):/, '<img class="emoticon" ng-src="/assets/images/$1.png"/>');
					match = /:([^0-9:]*):/.exec(text);
				}

				// check for a fatality
				match = /:(\w*)*:/.exec(text);
				if (match) {
					var fatality = '<img class="fatality" ng-src="/assets/images/fatalities/' + match[1] + '.gif"/>';
					text = text.replace(/:(\w*):/, '');
					text = "<div class=\"fight-message\">" + text + "</div>" + fatality;
				}
				if (text.match(/&#10;/g)) {  // unicode 10 is tabs/whitespace
					text = '<div message="::bunkerMessage" ><pre>' + text + '</pre></div>';
					return text
				}

				return text;
			}

			function parseCode(text) {
				text = `<div message="::bunkerMessage" bunker-quote><div hljs no-escape>${text}</div></div>`;
				return text;
			}

			function parseEmoticons(text) {
				const replacedEmotes = {};

				// Parse emoticons
				_.each(text.match(/:[\w-]+:/g), emoticonText => {
					const knownEmoticon = _.find(emoticons.all, known => {
						return known.file.replace(/\.\w{1,4}$/, '').toLowerCase() === emoticonText.replace(/:/g, '').toLowerCase();
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon.file]) {
						// if an image emoticon (more common)
						if (!knownEmoticon.isIcon) {
							text = replaceAll(text, emoticonText,
								`<img class="emoticon" title="${emoticonText}" ng-src="/assets/images/emoticons/${knownEmoticon.file}"/>`);
						}
						else { // font-awesome icon emoticon
							text = replaceAll(text, emoticonText,
								`<i class="fa ${knownEmoticon.file} fa-lg" title=":${knownEmoticon.name}:"></i>`);
						}
						replacedEmotes[knownEmoticon.file] = true;
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
					var lookup = new RegExp('(\\' + type.marker + '[^\\' + type.marker + ']+\\' + type.marker + ')', 'g');

					var match;
					while ((match = lookup.exec(text)) !== null) {
						text = replaceAll(text, match[0].trim(), '<' + type.tag + '>' + replaceAll(match[0], type.marker, '') + '</' + type.tag + '>');
					}
				});

				return text;
			}

			function parseMedia(text) {
				var replacedLinks = {};

				var shouldParseMedia = typeof scope.media !== 'undefined' ? scope.$eval(scope.media) : true;

				// do no media on mobile
				const onMobile = _.includes(navigator.appVersion, 'Android')
					|| _.includes(navigator.appVersion, 'iPhone')

				// if user turns off link meta, replace meta object with empty object
				const {image, title, url} = bunkerData.userSettings.linkPreview ? (scope.bunkerMessage.linkMeta || {}) : {}

				// Parse links
				var attachedMedia;
				const links = [...text.match(/https?:\/\/\S+/gi)]
				if (image) {
					links.push(image)
				}

				_.each(links, function (link) {
					if (!replacedLinks[link]) {
						const target = _.includes(link, window.location.origin) ? '_self' : '_blank'
						text = replaceAll(text, link, `<a href="${link}" target="${target}">${link}</a>`);
						replacedLinks[link] = true;
					}

					if (!shouldParseMedia) return text;

					// Only parse media (images, youtube) if asked to
					if (/imgur.com\/\w*\.(gifv|webm|mp4)$/i.test(link) && !attachedMedia) {
						if (onMobile) return text

						var imgurLinkMpeg = link.replace('webm', 'mp4').replace('gifv', 'mp4');
						var imgurLinkWebm = link.replace('mp4', 'webm').replace('gifv', 'webm');
						toggleLink(link);
						attachedMedia = `
							<div ng-click="bunkerMessage.$visible = false" message="::bunkerMessage" bunker-media="${link}">
								<video class="imgur-gifv" preload="auto" autoplay muted webkit-playsinline loop>
									<source type="video/webm" ng-src="${imgurLinkWebm}">
									<source type="video/mp4" ng-src="${imgurLinkMpeg}">
								</video>
							</div>`;
					}
					else if (/\.(gifv|mp4|webm)$/i.test(link) && !attachedMedia) {
						if (onMobile) return text

						toggleLink(link);
						attachedMedia = `
							<div ng-click="bunkerMessage.$visible = false" message="::bunkerMessage" bunker-media="${link}">
								<video autoplay loop muted>
									<source type="video/mp4" ng-src="${link.toLowerCase().replace('gifv', 'mp4')}">
								</video>
							</div>`;
					}
					else if (youtubeRegexp().test(link) && !attachedMedia) {
						toggleLink(link);
						attachedMedia = `
							<div class="default-video-height" message="::bunkerMessage" bunker-media="${link}">
								<youtube-video video-url="'${link}'"></youtube-video>
							</div>`;
					}
					else if (/(www\.)?(twitter\.com\/)/i.test(link) && !attachedMedia) {
						var id = link.substr(link.lastIndexOf('/') + 1);
						if (id) { // don't embed tweet if we can't get the id from the link
							toggleLink(link);
							attachedMedia = `
								<div message="::bunkerMessage" bunker-media="${link}">
									<div class="stupid-twitter tweet_${id}">
										<script src="https://api.twitter.com/1/statuses/oembed.json?id=${id}&amp;callback=addTweet&amp"></script>
									</div>
								</div>`;
						}
					}
					else if (/vimeo\.com(?:.*)?\/([A-z0-9]*)$/i.test(link) && !attachedMedia) {
						var match = /vimeo\.com(?:.*)?\/([a-zA-Z0-9]*)$/i.exec(link);
						toggleLink(link);
						attachedMedia = `
							<div message="::bunkerMessage" bunker-media="${link}">
								<iframe ng-src="https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0" width="750" height="422" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
							</div>`;
					}
					else if (/^https?:\/\/(?:play|open)\.spotify\.com\/(.*)/gi.test(link) && !attachedMedia) {
						var match = /^https?:\/\/(?:play|open)\.spotify\.com\/(.*)/gi.exec(link);
						var uri = "spotify%3A" + replaceAll(match[1], '/', '%3A');

						toggleLink(link);
						attachedMedia = `
							<div message="::bunkerMessage" bunker-media="${link}">
								<iframe ng-src="https://embed.spotify.com/?uri=${uri}" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>
							</div>`;
					}
					else if (/gfycat\.com\/(?:detail\/)*(\w+)(?:$|\?|.gif)/gi.test(link) && !attachedMedia) {
						var match = /gfycat\.com\/(?:detail\/)*(\w+)(?:$|\?|.gif)/gi.exec(link);

						toggleLink(link);
						attachedMedia = `
							<div message="::bunkerMessage" bunker-media="${link}">
								<div gfycat class="gfyitem" data-title=true data-autoplay=true data-controls=true data-expand=true data-id="${match[1]}" ></div>
							</div>`;
					}
					// run this one last since it conflicts with the gifv check above
					else if (/\.(gif|png|jpg|jpeg)/i.test(link) && !attachedMedia) {
						// Image link
						toggleLink(link);
						toggleLink(url);

						const mobileParam = onMobile ? '?small=true' : ''

						const wrappedLink = (onMobile || bunkerData.userSettings.bunkerServesImages)
							? `/api/image/${encodeURIComponent(link)}${mobileParam}`
							: link

						const titleHtml = title ? `<h5>${title}</h5>` : ''
						const previewImageCss = link ? 'image-preview' : ''

						attachedMedia = `
						<div ng-click="bunkerMessage.$visible = false" message="::bunkerMessage" bunker-media="${wrappedLink}">
							${titleHtml}
							<img class="${previewImageCss}" ng-src="${wrappedLink}" imageonload/>
						</div>`
					}
				});

				// If we made an image, attach it now
				if (attachedMedia) {
					const element = angular.element(attachedMedia)
					elem.append(element);
				}

				return text;

				function toggleLink(link) {
					var toggleButton = `<a ng-click="bunkerMessage.$visible = !bunkerMessage.$visible">
							<i class="fa fa-lg" ng-class="{'fa-caret-square-o-down': bunkerMessage.$visible, 'fa-caret-square-o-left': !bunkerMessage.$visible}"></i>
						</a>`;

					text = text.replace(`${link}</a>`, `${link}</a> ${toggleButton}`);
				}
			}
		}
	};
});


app.directive('imageonload', function ($rootScope) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.bind('load', function () {
				$rootScope.$broadcast('messageImageLoaded', {height: this.height})
			});
			element.bind('error', function () {
				console.log('image could not be loaded');
			});
		}
	};
});

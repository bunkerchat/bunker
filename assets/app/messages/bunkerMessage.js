/* global app, _ */

app.directive('bunkerMessage', function ($compile, emoticons) {
	'use strict';

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

	//function extractVideoID(url){
	//	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	//	var match = url.match(regExp);
	//	if ( match && match[7].length == 11 ){
	//		return match[7];
	//	}else{
	//		alert("Could not extract video ID.");
	//	}
	//}

	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			text: '@bunkerMessage',
			media: '@'
		},
		link: function (scope, elem) {

			var parseMedia = typeof scope.media !== 'undefined' ? scope.$eval(scope.media) : true;

			scope.$watch('text', function (text) {
				var formatted = text,
					replacedEmotes = {},
					replacedLinks = {};

				// Parse quotes
				if (text.match(/\n[^$]/g)) {

					// Scan for overtabs
					var lines = formatted.split('\n');
					var firstLineSpacingMatch = _.first(lines).match(/^(\s+)/);

					// If we have some spacing on the first line, remove the same spacing from all other lines (detabs everything)
					if (firstLineSpacingMatch) {
						var firstLineSpacingExpression = new RegExp('^' + firstLineSpacingMatch[1] + '');
						var spacingRemoved = _.map(lines, function (line) {
							return line.replace(firstLineSpacingExpression, '');
						});
						formatted = spacingRemoved.join('\n');
					}

					// Put in code block
					var quote = [];
					quote.push('<div class="panel"><pre>');
					quote.push(formatted);
					quote.push('</pre></div>');

					formatted = quote.join('');
				}
				else {

					// Parse bold
					_.each(text.match(/(?:[^A-Za-z0-9]|^)(\*[^\*]+\*)(?:[^A-Za-z0-9]|$)/g), function (bold) {
						formatted = replaceAll(formatted, bold, '<strong>' + bold.replace(/\*/g, '') + '</strong>');
					});

					// Parse italics
					_.each(text.match(/(?:[^A-Za-z0-9]|^)(_[^_]+_)(?:[^A-Za-z0-9]|$)/g), function (italics) {
						formatted = replaceAll(formatted, italics, '<em>' + italics.replace(/_/g, '') + '</em>');
					});

					// Parse emoticons
					_.each(text.match(/:\w+:/g), function (emoticonText) {
						var knownEmoticon = _.find(emoticons.files, function (known) {
							return known.replace(/\.\w{1,4}$/, '').toLowerCase() == emoticonText.replace(/:/g, '').toLowerCase();
						});
						if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
							formatted = replaceAll(formatted, emoticonText,
								'<img class="emoticon" title="' + emoticonText + '" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
							replacedEmotes[knownEmoticon] = true;
						}
					});

					// Parse links
					var attachedMedia;
					_.each(text.match(/https?:\/\/\S+/gi), function (link) {

						// Only parse media (images, youtube) if asked to
						if (parseMedia) {
							if (/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedMedia) {
								// Image link
								attachedMedia = angular.element('<div bunker-media="' + link + '"><img src="' + link + '"/></div>');
							}
							else if(/\.(gifv|mp4)$/i.test(link) && !attachedMedia) {
								attachedMedia = angular.element('' +
								'<div bunker-media="' + link + '">' +
								'<video autoplay loop muted><source type="video/mp4" src="' + link.toLowerCase().replace('gifv', 'mp4')  + '"></video>' +
								'</div>');
							}
							else if (/(www\.)?(youtube\.com|youtu\.?be)\/watch/i.test(link) && !attachedMedia) {
								attachedMedia = angular.element('' +
								'<div class="default-video-height" bunker-media="' + link + '">' +
								'<youtube-video video-url="\'' + link + '\'"></youtube-video>' +
								'</div>');
							}
						}

						if (!replacedLinks[link]) {
							formatted = replaceAll(formatted, link, '<a href="' + link + '" target="_blank">' + link + '</a>');
							replacedLinks[link] = true;
						}
					});

					// If we made an image, attach it now
					if (attachedMedia) {
						angular.element(elem).append(attachedMedia);
						$compile(attachedMedia)(scope.$new());
					}
				}

				scope.formatted = formatted;
			});
		}
	};
});

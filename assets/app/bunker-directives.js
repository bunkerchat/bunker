app.directive('fill', function ($window, $timeout) {
	return {
		restrict: 'AC',
		link: function (scope, elem, attrs) {
			var options = scope.$eval(attrs.fill);
			var windowEl = angular.element($window);
			var el = angular.element(elem);
			var marginBottom = options.marginBottom || 0;

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
	};
});
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
app.directive('bunkerInput', function($window, user) {
	return {
		scope: {
			text: '=bunkerInput'
		},
		link: function(scope, elem) {
			scope.$on('inputText', function(evt, text) {
				var append = scope.text.length ? ' ' : ''; // start with a space if message already started
				append += text + ' ';
				scope.text += append;
				angular.element(elem).focus();
			});

			// Handle user away notification
			var win = angular.element($window);
			win.bind('focus', function () {
				scope.$apply(function() {
					user.current.present = true;
					user.current.$save();
				});
			});
			win.bind('blur', function () {
				scope.$apply(function() {
					user.current.present = false;
					user.current.$save();
				});
			});
		}
	};
});
app.directive('bunkerMessage', function ($compile, $timeout, emoticons) {
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
					formatted = formatted.replace(bold, '<strong>' + bold.replace(/\*/g, '') + '</strong>');
				});

				// Parse italics
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(_[A-Za-z0-9\s]+_)(?:[^A-Za-z0-9]|$)/g), function (italics) {
					formatted = formatted.replace(italics, '<em>' + italics.replace(/_/g, '') + '</em>');
				});

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return new RegExp(known.replace(/\.\w{1,4}$/, '') + '$', 'i').test(emoticonText.replace(/:/g, ''));
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
						formatted = formatted.replace(new RegExp(emoticonText, 'g'),
								'<img class="emoticon" title="' + emoticonText + '" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
						replacedEmotes[knownEmoticon] = true;
					}
				});

				// Parse twitter links
				var attachedTweet;
				_.each(text.match(/([\w+]*)+https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)+([\w+]*)/gi), function (link) {
					if (!attachedTweet) {
						attachedTweet = angular.element('<div bunker-message-tweet="' + link + '"></div>');
					}
				});

				// Parse links
				var attachedImage;
				_.each(text.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi), function (link) {
					if (/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedImage) {
						// Image link
						attachedImage = angular.element('<div bunker-message-image="' + link + '"></div>');
					}

					if (!replacedLinks[link]) {
						formatted = formatted.replace(new RegExp(link, 'g'), '<a href="' + link + '" target="_blank">' + link + '</a>');
						replacedLinks[link] = true;
					}
				});

				// If we made an tweet, attach it now
				if (attachedTweet) {
					angular.element(elem).append(attachedTweet);
					$compile(attachedTweet)(scope.$new());
					$timeout(function () {
						twttr.widgets.load();
					}, 1);

				}

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

app.directive('bunkerMessageTweet', function () {
	return {
		templateUrl: '/assets/app/room/bunker-message-tweet.html',
		scope: {
			link: '@bunkerMessageTweet'
		},
		link: function (scope) {
			scope.visible = true;
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

app.directive('messageMention', function() {
	return {
		scope: {
			userNick: '@messageMention',
			messageText: '@messageMentionText'
		},
		link: function(scope, elem) {
			if(new RegExp(scope.userNick + '(?:[^@\\w]|$)', 'i').test(scope.messageText)) {
				elem.addClass('message-mention');
			}
		}
	}
});

app.directive('unreadMessages', function ($rootScope, $window, user) {
	return function (scope, elem) {
		var el = angular.element(elem);
		var win = angular.element($window);

		var hasFocus = true;
		var unreadMessages = 0;
		var mentioned = false;
		var original = el.text();

		win.bind('focus', function () {
			hasFocus = true;
			unreadMessages = 0;
			mentioned = false;
			el.text(original);
		});
		win.bind('blur', function () {
			hasFocus = false;
		});

		$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
			if (!hasFocus && resource.model == 'room' && resource.data.author && user.current.$resolved) {
				unreadMessages++;
				if (new RegExp(user.current.nick, 'i').test(resource.data.text)) {
					// TODO this probably won't work if user changes their nick
					mentioned = true;
				}

				var newTitle = [];
				if (mentioned) newTitle.push('*');
				newTitle.push('(' + unreadMessages + ') ');
				newTitle.push(original);
				el.text(newTitle.join(''));
			}
		});
	};
});


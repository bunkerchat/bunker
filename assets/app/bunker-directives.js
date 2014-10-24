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

// Directive to handle outside influences on the input/chat box
// Currently handles 3 functions:
// 1. updating the text in the box when an event (inputText) is broadcast
// 2. informing the user service if the text changes, so it can broadcast typing to other connected users
// 3. updating the user when the window is blurred/focused
app.directive('bunkerInput', function($stateParams, $window, user) {
	return {
		scope: {
			text: '=bunkerInput'
		},
		link: function(scope, elem) {

			// Change the text if commanded to do so
			scope.$on('inputText', function(evt, text) {
				var append = scope.text.length ? ' ' : ''; // start with a space if message already started
				append += text + ' ';
				scope.text += append;
				angular.element(elem).focus();
			});

			// Broadcast typing when the text changes
			scope.$watch('text', function(value, oldValue) {
				if(!value || !oldValue || value == oldValue) return;
				user.broadcastTyping($stateParams.roomId);
			});

			// Handle user away notification on window focus/blur
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

// override the angular-bootstrap datepicker directive due to changes in angular 1.3
app.directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
	return {
		restrict: 'A',
		priority: 1,
		require: 'ngModel',
		link: function(scope, element, attr, ngModel) {
			var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
			ngModel.$formatters.push(function (value) {
				return dateFilter(value, dateFormat);
			});
		}
	};
});


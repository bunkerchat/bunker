app.factory('pinBoard', ['$window', '$rootScope', '$q', function ($window, $rootScope, $q) {
	var io = $window.io;

	var pinLookup = {};

	var pinChangedListener = null;

	function pinChanged(state) {
		if (state.pinned) {
			pinLookup[state.messageId] = state.messageId;
		}
		else {
			delete pinLookup[state.messageId];
		}

		pinChangedListener(state);
	}

	return {
		setPinChangedListener: function (listener) {
			pinChangedListener = listener;
		},
		initialize: function (messages) {
			pinLookup = _.indexBy(_.map(messages, 'id'));
		},

		pinChanged: pinChanged,

		savePin: function (messageId) {
			return $q(function (resolve) {
				io.socket.post('/room/' + $rootScope.roomId + '/pins', {messageId: messageId}, function () {
					resolve();
				});
			});
		},
		unPin: function (messageId) {
			return $q(function (resolve) {
				io.socket.delete('/room/' + $rootScope.roomId + '/pins/' + messageId, function (res) {

					resolve(res);
				});
			});
		},
		isPinned: function (messageId) {
			return !!pinLookup[messageId];
		}
	};
}]);

app.directive('pins', ['pinBoard', function (pinBoard) {

	return {
		restrict: 'A',
		templateUrl: '/assets/app/pinBoard/pinBoard.html',
		scope: {
			pinnedMessages: '=pins'
		},
		link: function (scope, element, attrs) {

			scope.removePin = function(message) {
				console.log(message);
			};

			scope.boardOpen = false;

			// Using 'handler' option for on/off because of race condition with
			// scope create/destroy with this directive.
			var closeClickListener = function () {
				if (!scope.boardOpen) {
					return true;
				}

				scope.boardOpen = false;
				scope.$digest();
			};

			$(document)
					.on('click.pinBoard', closeClickListener)
					.on('click.pinBoard', '[pins]', function () {
						return false;
					});

			scope.$on('$destroy', function () {
				$(document).off('click.pinBoard', closeClickListener);
			});

		}
	};
}]);

app.directive('messagePin', ['pinBoard', function (pinBoard) {

	function updateIcon(pinResult) {

		var $pinIconForMessage = $('[message-pin=' + pinResult.messageId + '] .message-pin-icon');

		if (pinResult.pinned) {
			$pinIconForMessage.removeClass('fa-bookmark-o').addClass('fa-bookmark');
		}
		else {
			$pinIconForMessage.removeClass('fa-bookmark').addClass('fa-bookmark-o');
		}
	}

	pinBoard.setPinChangedListener(updateIcon);

	function handlePinClick() {

		var messageId = $(this).closest('[message-pin]').attr('message-pin');

		if (!messageId) {
			return;
		}

		if (pinBoard.isPinned(messageId)) {
			pinBoard.unPin(messageId);
		}
		else {
			pinBoard.savePin(messageId);
		}
	}

	return {
		restrict: 'A',
		templateUrl: '/assets/app/pinBoard/messagePin.html',
		link: function (scope, element, attrs) {

			element.click(handlePinClick);

			if (pinBoard.isPinned(attrs.messagePin)) {
				element.find('.message-pin-icon').removeClass('fa-bookmark-o').addClass('fa-bookmark');
			}
		}
	};
}]);

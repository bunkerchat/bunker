app.factory('pinBoard', ['$window', '$rootScope', function ($window, $rootScope) {
	var io = $window.io;

	var pinLookup = {};

	var pinChangedListener = null;

	return {
		setPinChangedListener: function (listener) {
			pinChangedListener = listener;
		},
		initialize: function (messages) {
			pinLookup = _.keyBy(_.map(messages, 'message._id'));
		},

		pinChanged: function pinChanged(state) {
			if (state.pinned) {
				pinLookup[state.pinnedMessage.message._id] = state.pinnedMessage.message._id;
			}
			else {
				delete pinLookup[state.pinnedMessage.message._id];
			}

			pinChangedListener(state);
		},

		savePin: function (messageId) {
			return io.socket.emitAsync('/room/pinMessage', {messageId: messageId, roomId: $rootScope.roomId})
		},
		unPin: function (messageId) {
			return io.socket.emitAsync('/room/unPinMessage', {messageId: messageId, roomId: $rootScope.roomId});
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
			pinnedMessages: '=pins',
			userRole: '='
		},
		link: function (scope, element, attrs) {

			scope.removePin = function(message) {
				pinBoard.unPin(message.message._id);
			};

			scope.boardOpen = false;

			var pinBoardCloseHandler = function(event) {
				var holder = $(event.target).closest('.pin-board-holder');

				if (!holder.length) {
					scope.closeBoard(true);
				}

				return true;
			};

			scope.closeBoard = function(digest) {

				scope.boardOpen = false;

				$(document).off('click.pinBoard');

				if (digest) {
					scope.$digest();
				}
			};

			scope.toggleBoard = function() {

				scope.boardOpen = !scope.boardOpen;

				if (scope.boardOpen) {
					$(document).off('click.pinBoard').on('click.pinBoard', pinBoardCloseHandler);
				}
				else {
					$(document).off('click.pinBoard');
				}
			};
		}
	};
}]);

app.directive('messagePin', ['pinBoard', function (pinBoard) {

	function updateIcon(pinResult) {

		var $pinIconForMessage = $('.message-info [message-pin=' + pinResult.pinnedMessage.message._id + '] .message-pin-icon');

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

			var $messagePinIcon = element.find('.message-pin-icon');

			if (attrs.userRole === 'moderator' || attrs.userRole === 'administrator') {
				$messagePinIcon = $messagePinIcon.removeClass('disabled');
				element.click(handlePinClick);
			}
			else {
				$messagePinIcon[0].title = '';
			}

			if (pinBoard.isPinned(attrs.messagePin)) {
				$messagePinIcon.removeClass('fa-bookmark-o').addClass('fa-bookmark');
			}
		}
	};
}]);

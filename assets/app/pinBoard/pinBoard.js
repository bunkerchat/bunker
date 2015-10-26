app
	.factory('pinBoard', ['$window', '$rootScope', '$q', function($window, $rootScope, $q) {
		var io = $window.io;

		var pinLookup = { };

		var pinChangedListener = null;

		function pinChanged(state) {
			pinChangedListener(state);
		}

		return {
			setPinChangedListener: function(listener) {
				pinChangedListener = listener;
			},
			initialize: function(messages) {
				pinLookup = _.indexBy(_.map(messages, 'id'));
			},

			pinChanged: pinChanged,

			savePin: function(messageId) {
				return $q(function(resolve) {
					io.socket.post('/room/' + $rootScope.roomId + '/pins', { messageId: messageId }, function() {
						resolve();
					});
				});
			},
			unPin: function(messageId) {
				return $q(function(resolve) {
					io.socket.delete('/room/' + $rootScope.roomId + '/pins/' + messageId, function() {
						resolve();
					});
				});
			},
			isPinned: function(messageId) {
				return !!pinLookup[messageId];
			}
		};
	}])
	.directive('pins', ['pinBoard', function(pinBoard) {

		return {
			restrict: 'A',
			templateUrl: '/assets/app/pinBoard/pinBoard.html',
			scope: {
				pinnedMessages: '=pins'
			},
			link: function(scope, element, attrs) {

			}
		};
	}])
	.directive('messagePin', ['pinBoard', function(pinBoard) {

			pinBoard.setPinChangedListener(updateIcon);

			function updateIcon(pinResult) {
				var $pinIconForMessage = $('[message-pin=' + pinResult.id + ']');
				$pinIconForMessage.removeClass('fa-bookmark-o').addClass('fa-bookmark');
			}

			function handlePinClick(evt) {
				// TODO: toggle the class here based on if it's pinned or not.
				var messageId = $(this).closest('[message-pin]').attr('message-pin');
				// TODO: Only set the class based on a successful response

				// TODO: still need some way to update the element based on pin event from server.
				if (pinBoard.isPinned(evt)) {
					pinBoard.unPin(messageId);//.then(updateIcon);
				}
				else {
					pinBoard.savePin(messageId);//.then(updateIcon);
				}
			}

			return {
				restrict: 'A',
				templateUrl: '/assets/app/pinBoard/messagePin.html',
				link: function(scope, element, attrs) {

					element.click(handlePinClick);

					if (pinBoard.isPinned(attrs.messagePin)) {
						element.find('.message-pin-icon').removeClass('fa-bookmark-o').addClass('fa-bookmark');
					}
				}
			};
		}])
	.directive('messagePinController', ['pinBoard', function(pinBoard) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					/*element.on('click', '.message-info', function(evt) {

						// TODO: if pinned, un pin.
						// also, populate pins with set from server.
						var $target = $(this);

						var messageId = $target.attr('message-pin-id');

						pinBoard.savePin(messageId).then(function() {
							// Mark dom as pinned!
							$target.children(0).removeClass('fa-bookmark-o');
							$target.children(0).addClass('fa-bookmark');
						});

						// TODO: fix this... need some way to delegate back to the actual pin
						// and tell it to update.
					});*/
				}
			};
		}]);

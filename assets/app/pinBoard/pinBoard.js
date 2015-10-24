app
	.factory('pinBoard', ['$window', '$rootScope', '$q', function($window, $rootScope, $q) {
		var io = $window.io;

		return {
			savePin: function(messageId) {
				return $q(function(resolve) {
					io.socket.post('/room/' + $rootScope.roomId + '/pins', { messageId: messageId }, function() {
						resolve();
					});
				});
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
			return {
				restrict: 'A',
				templateUrl: '/assets/app/pinBoard/messagePin.html',
				link: function(scope, element, attrs) {

				}
			};
		}])
	.directive('messagePinController', ['pinBoard', function(pinBoard) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					element.on('click', '.message-info', function(evt) {

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
					});
				}
			};
		}]);

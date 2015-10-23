app
	.factory('pinBoard', ['$window', function($window) {
		var io = $window.io;

		return {
			savePin: function() {
				// TODO: implement me!
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
					element.on('click', '.message-pin-icon', function(evt) {

						// TODO: fix this... need some way to delegate back to the actual pin
						// and tell it to update.

						debugger;

					});
				}
			};
		}]);

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
	}]);

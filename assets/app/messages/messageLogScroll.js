app.directive('messageLogScroll', function ($timeout, $rootScope, bunkerData) {
	return {
		scope: {
			roomId: '@',
			onScrollTop: '&'
		},
		link: function ($scope, elem) {
			var el = elem[0];
			var tolerance = 31;
			var clearMessageCounter = 0;

			function atBottomOfPage() {
				return el.scrollTop + el.clientHeight + tolerance >= el.scrollHeight;
			}

			$rootScope.$on('bunkerMessaged', function (evt, message) {

				if (atBottomOfPage()) {
					// Check for images
					var image = angular.element('#' + message.id).find('img');
					if (image.length) {
						// If we have an image, wait for it to load before scrolling
						image.load(function () {
							scroll(250);
						});
					} else {
						// Otherwise scroll immediately
						scroll();
					}

					// if the user is only watching new messages, trim the message log
					clearMessageCounter++;
					if (clearMessageCounter > 5) {
						bunkerData.clearOldMessages($scope.roomId);
						clearMessageCounter = 0;
					}
				} else {
					clearMessageCounter = 0;
				}
			});

			// Watch scrolling to top, execute given function
			angular.element(el).bind('scroll', function () {
				if (el.scrollTop == 0 && angular.isFunction($scope.onScrollTop)) { // We're at the top
					var originalHeight = el.scrollHeight;
					$scope.onScrollTop().then(function () {
						$timeout(function () {
							el.scrollTop = el.scrollHeight - originalHeight;
						});
					});
				}
			});

			$scope.$on('roomIdChanged', scroll);

			// Scroll after state changes and when youtubes have loaded
			$rootScope.$on('youtube.player.ready', function(){
				if(!atBottomOfPage()) return;
				scroll();
			});

			function scroll(waitTime) {
				$timeout(function () {
					elem.scrollTop(el.scrollHeight);
				}, waitTime || 0);
			}
		}
	};
});

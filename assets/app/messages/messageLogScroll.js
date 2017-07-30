app.directive('messageLogScroll', function ($timeout, $rootScope, bunkerData, animationControl) {
	return {
		scope: {
			roomId: '@',
			onScrollTop: '&'
		},
		link: function ($scope, elem) {
			var el = elem[0];
			var tolerance = 31;
			var clearMessageCounter = 0;

			function atBottomOfPage(height) {
				height = height || 0
				return el.scrollTop + el.clientHeight + tolerance + height  >= el.scrollHeight;
			}

			$rootScope.$on('bunkerMessaged', function (evt, message) {
				if (atBottomOfPage() || message.author._id == bunkerData.user._id) {
					scroll();

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

			$rootScope.$on('messageImageLoaded', (evt, image) =>{
				if (atBottomOfPage(image.height)){
					scroll()
				}
			})

			// Watch scrolling to top, execute given function
			angular.element(el).bind('scroll', _.throttle(function () {
				// We're at the top
				if (el.scrollTop == 0 && angular.isFunction($scope.onScrollTop)) {
					var originalHeight = el.scrollHeight;
					$scope.onScrollTop()
						.then(() => $timeout(() => {
							el.scrollTop = el.scrollHeight - originalHeight
						}));
				}
			}, 50));

			$scope.$on('roomIdChanged', function () {
				$timeout(function () {
					animationControl.stop();
					animationControl.start();
				});

				scroll();
			});

			$scope.$on('visibilityHide', function () {
				$timeout(() => animationControl.stop({all: true}));
			});

			$scope.$on('visibilityShow', function () {
				$timeout(() => animationControl.start());
			});

			// Scroll after state changes and when youtubes have loaded
			$rootScope.$on('youtube.player.ready', function () {
				if (!atBottomOfPage()) return;
				scroll();
			});

			bunkerData.$promise.then(() => {
				if (!atBottomOfPage()) return;
				scroll(1000);
			});

			function scroll(waitTime) {
				$timeout(() => {
					elem.scrollTop(el.scrollHeight);
				}, waitTime || 0);
			}
		}
	};
});

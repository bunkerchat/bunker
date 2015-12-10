app.directive('roomScroll', function ($timeout, $rootScope, bunkerData) {
	return {
		scope: {
			roomId: '@'
		},
		controller: function () {
			var self = this;
			var elem = angular.element('body');
			var el = elem[0];
			var clearMessageCounter = 0;

			function atBottomOfPage() {
				return window.innerHeight + window.scrollY >= document.body.offsetHeight;
			}

			$rootScope.$on('bunkerMessaged', function (evt, message) {
				if (atBottomOfPage() || message.author._id == bunkerData.user._id) {
					// Check for images
					var image = angular.element('#' + message._id).find('img');
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
						bunkerData.clearOldMessages(self.roomId);
						clearMessageCounter = 0;
					}
				} else {
					clearMessageCounter = 0;
				}
			});

			//// Watch scrolling to top, execute given function
			//angular.element(el).bind('scroll', _.throttle(function () {
			//	if (el.scrollTop == 0 && angular.isFunction($scope.onScrollTop)) { // We're at the top
			//		var originalHeight = el.scrollHeight;
			//		$scope.onScrollTop().then(function () {
			//			$timeout(function () {
			//				el.scrollTop = el.scrollHeight - originalHeight;
			//			});
			//		});
			//	}
			//}, 50));


			function scroll(waitTime) {
				$timeout(function () {
					elem.scrollTop(el.scrollHeight);
				}, waitTime || 0);
			}

			bunkerData.$promise.then(function () {
				scroll(100)
			});
		}
	}
});

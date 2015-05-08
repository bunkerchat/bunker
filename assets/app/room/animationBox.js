app.directive('animationBox', function ($rootScope, emoticons) {
	return {
		scope: {
			roomId: '@animationBox'
		},
		link: function ($scope, $element) {

			var el = angular.element($element);
			el.addClass('closed');

			$rootScope.$on('bunkerMessaged.animation', function (evt, message) {
				if(message.room.id == $scope.roomId) {

					var emoticon = (/:\w+:/.exec(message.text))[0];
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return known.replace(/\.\w{1,4}$/, '').toLowerCase() == emoticon.replace(/:/g, '').toLowerCase();
					});

					if(!knownEmoticon) return;

					el
						.empty()
						.append('<img src="/assets/images/emoticons/' + knownEmoticon + '"/>')
						.removeClass('closed');

					setTimeout(function() {
						el.addClass('closed');
					}, 3000);
				}
			});
		}
	};
});

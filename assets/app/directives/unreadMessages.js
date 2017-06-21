app.directive('unreadMessages', function ($rootScope, bunkerData) {
	return function (scope, elem) {
		var el = angular.element(elem);

		var hasFocus = true;
		var unreadMessages = 0;
		var mentioned = false;
		var original = el.text();
		var favico = new Favico();

		var mentionImage = $('<img ng-src="/assets/images/bunkerIcon_mention.png"/>')[0];
		var unreadImage = $('<img ng-src="/assets/images/bunkerIcon_unread.png" />')[0];

		$rootScope.$on('visibilityShow', function () {
			hasFocus = true;
			unreadMessages = 0;
			mentioned = false;
			el.text(original);
			favico.reset();
		});

		$rootScope.$on('visibilityHide', function () {
			hasFocus = false;
		});

		$rootScope.$on('bunkerMessaged', function (evt, message) {
			if (!bunkerData.$resolved || hasFocus || !message.author || message.author == bunkerData.user._id) return;
			unreadMessages++;

			if (bunkerData.mentionsUser(message.text)) {
				mentioned = true;
			}

			favico.image(mentioned ? mentionImage : unreadImage);

			var newTitle = [];
			newTitle.push('(' + unreadMessages + ') ');
			newTitle.push(original);
			el.text(newTitle.join(''));
		});
	};
});

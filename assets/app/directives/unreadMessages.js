app.directive('unreadMessages', function ($rootScope, bunkerData) {
	return function (scope, elem) {
		var el = angular.element(elem);

		var hasFocus = true;
		var unreadMessages = 0;
		var mentioned = false;
		var original = el.text();

		$rootScope.$on('visibilityShow', function () {
			hasFocus = true;
			unreadMessages = 0;
			mentioned = false;
			el.text(original);
		});

		$rootScope.$on('visibilityHide', function () {
			hasFocus = false;
		});

		$rootScope.$on('bunkerMessaged', function (evt, message) {
			if (!bunkerData.$resolved || hasFocus || !message.author || message.author == bunkerData.user.id) return;

			unreadMessages++;
			if (bunkerData.mentionsUser(message.text)) {
				mentioned = true;
			}

			var newTitle = [];
			if (mentioned) newTitle.push('*');
			newTitle.push('(' + unreadMessages + ') ');
			newTitle.push(original);
			el.text(newTitle.join(''));
		});
	};
});

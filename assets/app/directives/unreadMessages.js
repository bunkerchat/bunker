app.directive('unreadMessages', function ($rootScope, $window, user) {
	return function (scope, elem) {
		var el = angular.element(elem);
		var win = angular.element($window);

		var hasFocus = true;
		var unreadMessages = 0;
		var mentioned = false;
		var original = el.text();

		win.bind('focus', function () {
			hasFocus = true;
			unreadMessages = 0;
			mentioned = false;
			el.text(original);
		});
		win.bind('blur', function () {
			hasFocus = false;
		});

		$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
			if (!hasFocus && resource.model == 'room' && resource.data.author && user.current.$resolved) {
				unreadMessages++;
				if (new RegExp(user.current.nick, 'i').test(resource.data.text)) {
					// TODO this probably won't work if user changes their nick
					mentioned = true;
				}

				var newTitle = [];
				if (mentioned) newTitle.push('*');
				newTitle.push('(' + unreadMessages + ') ');
				newTitle.push(original);
				el.text(newTitle.join(''));
			}
		});
	};
});

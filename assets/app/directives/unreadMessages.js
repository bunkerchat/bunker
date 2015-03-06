app.directive('unreadMessages', function ($rootScope, user) {
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

		$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
			if (hasFocus || resource.model != 'room' || !resource.data.author || !user.current.$resolved ||
				resource.data.author == user.current.id) return;

			unreadMessages++;
			if (new RegExp(user.current.nick + '(?:[^@\\w]|$)', 'i').test(resource.data.text)) {
				// TODO this probably won't work if user changes their nick
				mentioned = true;
			}

			var newTitle = [];
			if (mentioned) newTitle.push('*');
			newTitle.push('(' + unreadMessages + ') ');
			newTitle.push(original);
			el.text(newTitle.join(''));
		});
	};
})
;

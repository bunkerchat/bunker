app.directive('bunkerMessageImage', function (user) {
	'use strict';

	return {
		templateUrl: '/assets/app/room/bunker-message-image.html',
		scope: {
			link: '@bunkerMessageImage'
		},
		link: function (scope) {
			scope.visible = user.settings.showImages;
		}
	};
});

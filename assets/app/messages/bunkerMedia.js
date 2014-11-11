app.directive('bunkerMedia', function (user) {
	'use strict';

	return {
		templateUrl: '/assets/app/messages/bunkerMedia.html',
		transclude:true,
		scope: {
			link: '@bunkerMedia'
		},
		link: function (scope) {
			scope.visible = user.settings.showImages;
		}
	};
});

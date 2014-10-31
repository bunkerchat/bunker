app.directive('bunkerMedia', function (user) {
	'use strict';

	return {
		templateUrl: '/assets/app/directives/bunkerMedia.html',
		transclude:true,
		scope: {
			link: '@bunkerMedia'
		},
		link: function (scope) {
			scope.visible = user.settings.showImages;
		}
	};
});

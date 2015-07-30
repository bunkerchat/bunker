app.directive('bunkerMedia', function (bunkerData) {
	'use strict';

	return {
		templateUrl: '/assets/app/messages/bunkerMedia.html',
		transclude: true,
		scope: {
			link: '@bunkerMedia',
			message: '='
		},
		link: function (scope) {
			if (!("$visible" in scope.message)) {
				scope.message.$visible = bunkerData.userSettings.showImages;
			}
		}
	};
});

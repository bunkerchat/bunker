app.directive('bunkerMedia', function (bunkerData) {
	'use strict';

	return {
		template: '<div class="bunker-media" ng-if="message.$visible" ng-transclude></div>',
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

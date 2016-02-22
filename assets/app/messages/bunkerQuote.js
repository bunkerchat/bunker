app.directive('bunkerQuote', function (bunkerData) {
	'use strict';

	return {
		templateUrl: '/assets/app/messages/bunkerQuote.html',
		transclude: true,
		scope: {
			message: '='
		},
		link: function (scope) {
			if (!("$visible" in scope.message)) {
				scope.message.$visible = bunkerData.userSettings.showImages;
			}
		}
	};
});

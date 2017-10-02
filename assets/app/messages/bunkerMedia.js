app.directive('bunkerMedia', function (bunkerData, animationControl, $timeout) {
	'use strict';

	return {
		template: '<div class="bunker-media"><div ng-if="$visible" ng-transclude></div></div>',
		transclude: true,
		scope: {
			link: '@bunkerMedia',
			message: '='
		},
		link: function (scope, elem) {
			if (!("$visible" in scope.message)) {
				scope.$visible = scope.message.$visible = bunkerData.userSettings.showImages;
			}

			scope.$watch('message.$visible', (val, oldVal)=> {
				if (val == oldVal)return;

				$timeout(() => {
					scope.$visible = val
				}, 15);

				if (val) return animationControl.start({elem});
				animationControl.stop({elem, all: true});
			});
		}
	};
});

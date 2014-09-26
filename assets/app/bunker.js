window.app = angular.module('bunker', ['sailsResource']);

app.directive('fill', function($window) {
    return {
        restrict: 'AC',
        scope: {
            marginBottom: '='
        },
        link: function (scope, elem) {
            scope.marginBottom = scope.marginBottom || 0;
            scope.$watch(function () {
                return $window.innerWidth + $window.innerHeight;
            }, function () {
                var el = angular.element(elem);
                var fillHeight = $window.innerHeight - el.position().top - scope.marginBottom;
                el.css({
                    height: fillHeight + 'px'
                });
            });
        }
    }
});

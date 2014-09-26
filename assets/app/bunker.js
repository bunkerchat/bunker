window.app = angular.module('bunker', ['sailsResource']);

app.directive('fill', function($window) {
    return {
        restrict: 'AC',
        scope: {
            marginBottom: '='
        },
        link: function (scope, elem) {
            var el = angular.element(elem);
            var marginBottom = scope.marginBottom || 0;

            scope.$watch(function () {
                return $window.innerWidth + $window.innerHeight;
            }, function () {
                var fillHeight = $window.innerHeight - el.offset().top - marginBottom;
                el.css({
                    height: fillHeight + 'px',
                    margin: 0
                });
            });
        }
    }
});
app.directive('autoScroll', function() {
    return function (scope, elem) {
        var el = angular.element(elem);
        scope.$watch(function () {
            return el.children().length;
        }, function () {
            el.scrollTop(el.prop('scrollHeight'));
        });
    };
});
app.directive('emoticonMenu', function($rootScope, $filter, $document) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			emoticons: '=emoticonMenu',
			visible: '=ngShow'
		},
		link: function(scope, el) {
			scope.emoticonMenuLists = [
				_.initial(scope.emoticons.files, Math.floor(scope.emoticons.files.length/2)),
				_.rest(scope.emoticons.files, Math.ceil(scope.emoticons.files.length/2))
			];
			scope.appendEmoticonToChat = function(emoticonFileName) {
				var emoticonName = ':' + $filter('emoticonName')(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);

				// Close window
				if(typeof scope.visible !== 'undefined') {
					scope.visible = false;
				}
			};

            $document.on('click.emoticons', function(e) {
                var wasEmoticonMenuClicked = $(e.target).closest(el).length > 0;

                if (!wasEmoticonMenuClicked && scope.visible) {
                    scope.visible = false;
                    scope.$apply();
                }
            });

            scope.$on('$destroy', function() {
               $document.off('click.emoticons');
            });
		}
	}
});
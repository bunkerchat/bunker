app.directive('emoticonMenu', function($rootScope, $filter) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			emoticons: '=emoticonMenu'
		},
		link: function(scope) {
			scope.emoticonMenuLists = [
				_.initial(scope.emoticons.files, scope.emoticons.files.length/2),
				_.rest(scope.emoticons.files, scope.emoticons.files.length/2)
			];
			scope.appendEmoticonToChat = function(emoticonFileName) {
				var emoticonName = ':' + $filter('emoticonName')(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);
			};
		}
	}
});
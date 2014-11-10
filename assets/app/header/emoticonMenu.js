app.directive('emoticonMenu', function($rootScope, $filter, user) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			emoticons: '=emoticonMenu',
			visible: '=ngShow'
		},
		link: function(scope) {
			scope.settings = user.settings;
			scope.toggleSetting = user.toggleSetting;
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
		}
	}
});

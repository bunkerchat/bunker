app.directive('emoticonMenu', function ($rootScope, $filter, user, emoticons, bunkerApi) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngShow'
		},
		link: function (scope) {
			scope.settings = user.settings;
			scope.toggleSetting = user.toggleSetting;
			scope.emoticonMenuLists = emoticons.collection;

			var emotesByAlpha = [
				_.initial(emoticons.list, Math.floor(emoticons.list.length / 2)),
				_.rest(emoticons.list, Math.ceil(emoticons.list.length / 2))
			];

			scope.$watch('settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;

				if (sortEmoticonsByPopularity) {
					bunkerApi.message.emoticonCounts().$promise.then(function (emoteCounts) {
						var emoteCountsHash = _.indexBy(emoteCounts,'name');

						_.each(emoticons.list, function (emoticon) {
							emoticon.$count = 0;
							if(emoteCountsHash[emoticon.name]){
								emoticon.$count = emoteCountsHash[emoticon.name].count;
							}
						});

						var orderedList = _(emoticons.list).sortBy('$count').reverse().value();

						scope.emoticonMenuLists = [
							_.initial(orderedList, Math.floor(orderedList.length / 2)),
							_.rest(orderedList, Math.ceil(orderedList.length / 2))
						]
					});
				}
				else {
					scope.emoticonMenuLists = emotesByAlpha;
				}
			});

			scope.appendEmoticonToChat = function (emoticonFileName) {
				var emoticonName = ':' + $filter('emoticonName')(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);

				// Close window
				if (typeof scope.visible !== 'undefined') {
					scope.visible = false;
				}
			};
		}
	}
});

app.filter('splitInHalf', function () {
	return function (list) {
		return [
			_.initial(list, Math.floor(list.length / 2)),
			_.rest(list, Math.ceil(list.length / 2))
		];
	}
});

app.filter('toArray', function () {
	return function (object) {
		if (_.isArray(object)) return object;
		return _.values(object);
	}
});

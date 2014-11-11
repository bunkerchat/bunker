app.directive('emoticonMenu', function ($rootScope, $filter, user, emoticons, bunkerApi) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngShow'
		},
		link: function (scope) {
			scope.settings = user.settings;
			scope.saveSettings = user.saveSettings;
			scope.emoticonMenuLists = [];
			scope.emoticonCounts = bunkerApi.message.emoticonCounts();

			var emotesByAlpha = splitInHalf(emoticons.list);

			scope.$watch('settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;

				if (!sortEmoticonsByPopularity) {
					scope.emoticonMenuLists = emotesByAlpha;
					return;
				}

				scope.emoticonCounts = bunkerApi.message.emoticonCounts();
			});

			scope.$watchCollection('emoticonCounts', function (emoteCounts, oldVal) {
				if (emoteCounts == oldVal) return;

				console.count('emoticonCounts watch');
				var emoteCountsHash = _.indexBy(emoteCounts, 'name');

				_.each(emoticons.list, function (emoticon) {
					if (emoteCountsHash[emoticon.name]) {
						emoticon.$count = emoteCountsHash[emoticon.name].count;
					}
				});

				var orderedList = _(emoticons.list).sortBy('$count').reverse().value();
				scope.emoticonMenuLists = splitInHalf(orderedList);
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
	};

	function splitInHalf(list) {
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

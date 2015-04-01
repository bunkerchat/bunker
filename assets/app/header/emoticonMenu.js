app.directive('emoticonMenu', function ($rootScope, $filter, user, emoticons, bunkerApi) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngShow'
		},
		link: function (scope) {
			scope.search = '';
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

			scope.$watch('visible', function (visible, oldVal) {
				if (visible == oldVal) return;

				if (!visible) {
					scope.search = '';
				}

				if (visible && scope.settings.sortEmoticonsByPopularity) {
					scope.emoticonCounts = bunkerApi.message.emoticonCounts();
				}
			});

			scope.$watchCollection('emoticonCounts', function (emoteCounts, oldVal) {
				if (emoteCounts == oldVal) return;

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
				scope.search = '';
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
			_.take(list, Math.floor(list.length / 2)),
			_.takeRight(list, Math.ceil(list.length / 2))
		];
	}
});


app.filter('toArray', function () {
	return function (object) {
		if (_.isArray(object)) return object;
		return _.values(object);
	}
});

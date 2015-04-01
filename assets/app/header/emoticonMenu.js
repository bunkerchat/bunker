app.directive('emoticonMenu', function ($rootScope, $filter, emoticons, bunkerData) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngShow'
		},
		link: function ($scope) {

			$scope.search = '';
			$scope.settings = bunkerData.userSettings;
			$scope.saveSettings = bunkerData.saveUserSettings;
			$scope.emoticonMenuLists = [];

			function refreshCounts() {
				bunkerData.getEmoticonCounts().then(function (emoticonCounts) {
					$scope.emoticonCounts = emoticonCounts;
				});
			}

			var emotesByAlpha = _.chunk(emoticons.list, Math.ceil(emoticons.list.length / 2));

			$scope.$watch('settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;

				if (!sortEmoticonsByPopularity) {
					$scope.emoticonMenuLists = emotesByAlpha;
					return;
				}

				refreshCounts();
			});

			$scope.$watch('visible', function (visible, oldVal) {
				if (visible == oldVal) return;

				if (!visible) {
					$scope.search = '';
				}
				else if ($scope.settings.sortEmoticonsByPopularity) {
					refreshCounts();
				}
			});

			$scope.$watchCollection('emoticonCounts', function (emoteCounts, oldVal) {
				if (emoteCounts == oldVal) return;

				var emoteCountsHash = _.indexBy(emoteCounts, 'name');

				_.each(emoticons.list, function (emoticon) {
					if (emoteCountsHash[emoticon.name]) {
						emoticon.$count = emoteCountsHash[emoticon.name].count;
					}
				});

				var orderedList = _(emoticons.list).sortBy('$count').reverse().value();
				$scope.emoticonMenuLists = _.chunk(orderedList, Math.ceil(orderedList.length / 2));
			});

			$scope.appendEmoticonToChat = function (emoticonFileName) {
				$scope.search = '';
				var emoticonName = ':' + $filter('emoticonName')(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);

				// Close window
				if (typeof $scope.visible !== 'undefined') {
					$scope.visible = false;
				}
			};

			refreshCounts();
		}
	};
});

app.filter('toArray', function () {
	return function (object) {
		if (_.isArray(object)) return object;
		return _.values(object);
	};
});

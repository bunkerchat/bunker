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

			function prepareList() {
				var list = bunkerData.userSettings.sortEmoticonsByPopularity ? _(emoticons.list).sortBy('$count').reverse().value() : emoticons.list;
				var filteredList = $filter('fuzzyBy')(list, 'name', $scope.search);
				$scope.emoticonMenuLists = _.chunk(filteredList, 4);
			}

			$scope.$watch('settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;
				if (sortEmoticonsByPopularity) {
					refreshCounts();
				}
				prepareList();
			});

			$scope.$watch('visible', function (visible, oldVal) {
				if (visible == oldVal) return;

				if (!visible) {
					$scope.search = '';
				}
				else if (bunkerData.userSettings.sortEmoticonsByPopularity) {
					refreshCounts();
				}
			});

			$scope.$watch('search', function () {
				prepareList();
			});

			$scope.$watchCollection('emoticonCounts', function (emoteCounts, oldVal) {
				if (emoteCounts == oldVal) return;

				var emoteCountsHash = _.indexBy(emoteCounts, 'name');
				_.each(emoticons.list, function (emoticon) {
					emoticon.$count = emoteCountsHash[emoticon.name] ? emoteCountsHash[emoticon.name].count : 0;
				});
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

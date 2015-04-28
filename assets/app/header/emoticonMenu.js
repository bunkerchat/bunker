app.directive('emoticonMenu', function ($rootScope, emoticons, bunkerData, fuzzyByFilter) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngShow'
		},
		controllerAs: 'menu',
		bindToController: true,
		controller: function ($scope) {
			var self = this;
			this.search = '';
			this.settings = bunkerData.userSettings;
			this.saveSettings = bunkerData.saveUserSettings;
			this.emoticonMenuLists = [];

			refreshCounts();

			function refreshCounts() {
				bunkerData.getEmoticonCounts().then(function (emoticonCounts) {
					self.emoticonCounts = emoticonCounts;

					var emoteCountsHash = _.indexBy(emoticonCounts, 'name');
					_.each(emoticons.list, function (emoticon) {
						emoticon.$count = emoteCountsHash[emoticon.name] ? emoteCountsHash[emoticon.name].count : 0;
					});

					prepareList();
				});
			}

			function prepareList() {
				var list = bunkerData.userSettings.sortEmoticonsByPopularity ? _(emoticons.list).sortBy('$count').reverse().value() : emoticons.list;
				var filteredList = fuzzyByFilter(list, 'name', self.search);
				self.emoticonMenuLists = _.chunk(filteredList, 4);
			}

			$scope.$watch('menu.settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;
				if (sortEmoticonsByPopularity) {
					refreshCounts();
				}
				prepareList();
			});

			$scope.$watch('menu.visible', function (visible, oldVal) {
				if (visible == oldVal) return;

				if (!visible) {
					self.search = '';
				}
				if (bunkerData.userSettings.sortEmoticonsByPopularity) {
					refreshCounts();
				}
			});

			$scope.$watch('menu.search', function (search, oldVal) {
				if (search == oldVal) return;
				prepareList();
			});

			this.appendEmoticonToChat = function (emoticonFileName) {
				self.search = '';
				var emoticonName = ':' + $filter('emoticonName')(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);

				// Close window
				if (typeof self.visible !== 'undefined') {
					self.visible = false;
				}
			};
		}
	};
});

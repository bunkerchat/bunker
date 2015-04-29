app.directive('emoticonMenu', function ($rootScope, emoticons, bunkerData, emoticons, fuzzyByFilter) {
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

			prepareList();

			function prepareList() {
				var list = bunkerData.userSettings.sortEmoticonsByPopularity ? _(emoticons.list).sortBy('$count').reverse().value() : emoticons.list;

				if(self.search){
					list = fuzzyByFilter(list, 'name', self.search);
				}

				self.emoticonMenuLists = _.chunk(list, 4);
			}

			$scope.$watch('menu.settings.sortEmoticonsByPopularity', function (sortEmoticonsByPopularity, oldVal) {
				if (sortEmoticonsByPopularity == oldVal) return;
				prepareList();
				if (sortEmoticonsByPopularity) {
					bunkerData.refreshEmoticonCounts().then(prepareList);
				}
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

			this.appendEmoticonToChat = function (emoticonName) {
				self.search = '';
				//var emoticonName = ':' + emoticonNameFilter(emoticonFileName) + ':';
				$rootScope.$broadcast('inputText', emoticonName);

				// Close window
				if (typeof self.visible !== 'undefined') {
					self.visible = false;
				}
			};
		}
	};
});

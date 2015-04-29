app.directive('emoticonMenu', function ($rootScope, bunkerData, emoticons, fuzzyByFilter) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngIf'
		},
		controllerAs: 'menu',
		bindToController: true,
		controller: function ($scope) {
			var self = this;
			this.search = '';
			this.userSettings = bunkerData.userSettings;
			this.emoticonMenuLists = [];
			this.prepareList = prepareList;

			prepareList();

			this.appendEmoticonToChat = function (emoticonName) {
				var emote = ":" + emoticonName + ":";
				$rootScope.$broadcast('inputText', emote);

				// Close window
				if (typeof self.visible !== 'undefined') {
					self.visible = false;
				}
			};

			this.sortPopularChanged = function () {
				bunkerData.saveUserSettings();
				prepareList();
			};

			function prepareList() {
				var list = bunkerData.userSettings.sortEmoticonsByPopularity ? _(emoticons.list).sortBy('$count').reverse().value() : emoticons.list;

				if (self.search) {
					list = fuzzyByFilter(list, 'name', self.search);
				}

				self.emoticonMenuLists = _.chunk(list, 4);
			}

			$scope.$on('$destroy', function () {
				bunkerData.refreshEmoticonCounts();
			})
		}
	};
});

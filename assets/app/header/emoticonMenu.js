app.directive('emoticonMenu', function ($rootScope, bunkerData, emoticons, fuzzyByFilter) {
	return {
		templateUrl: '/assets/app/header/emoticonMenu.html',
		scope: {
			visible: '=ngIf'
		},
		controllerAs: 'menu',
		bindToController: true,
		link: function ($scope) {
			var elementsToSkip = 'li[ng-class="{active: header.emoticonMenu}"], [emoticon-menu]';

			$(document)
				.on('click.bunker.emoticon-menu', $scope.menu.close)
				.on('click.bunker.emoticon-menu', elementsToSkip, function (e) {
					e.stopPropagation()
				});

			$scope.$on('$destroy', function () {
				$(document).off('click.bunker.emoticon-menu');
			});
		},
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
			};

			this.sortPopularChanged = function () {
				bunkerData.saveUserSettings();
				prepareList();
			};

			this.close = function () {
				// Close window
				if (typeof self.visible !== 'undefined') {
					self.visible = false;
				}
			};

			function prepareList() {
				var list = bunkerData.userSettings.sortEmoticonsByPopularity ? _(emoticons.imageEmoticons).sortBy('$count').reverse().value() : emoticons.imageEmoticons;

				if (self.search) {
					list = fuzzyByFilter(list, 'name', self.search);
				}

				self.emoticonMenuLists = _.chunk(list, 4);
			}

			$scope.$on('$destroy', function () {
				// bunkerData.refreshEmoticonCounts();
			});
		}
	};
});

app.directive('room', function ($rootScope, $state, bunkerData, emoticons, $window) {
	return {
		scope: {
			roomId: '@room'
		},
		templateUrl: '/assets/app/room/room.html',
		link: function ($scope, $element) {

			const el = angular.element($element);

			$scope.user = bunkerData.user;
			$scope.settings = bunkerData.userSettings;

			bunkerData.$promise.then(function () {
				$scope.current = bunkerData.getRoom($scope.roomId);

				$scope.currentMembership = _.find(bunkerData.memberships, {room: $scope.current._id});
				// Setup watches once we have data

				$scope.$watchCollection('current.$members', function (members) {
					if (!members) return;
					$scope.memberLookup = _.keyBy(members, function (roomMember) {
						return roomMember.user._id;
					});
					updateMemberList();
				});

				$scope.$watch('current.$selected', updateLastRead);

				updateMemberList();
			});

			$scope.openHistory = function () {
				$state.go('roomHistory', {roomId: $scope.roomId, date: moment().format('YYYY-MM-DD')});
			};
			$scope.mentionUser = function (userNick) {
				$rootScope.$broadcast('inputText', '@' + userNick);
			};
			$scope.loadPreviousMessages = function () {
				return bunkerData.loadMessages($scope.current, $scope.current.$messages.length).then(updateLastRead);
			};

			$rootScope.$on('bunkerMessaged.animation', function (evt, message) {
				if (!$scope.current.$selected) return;

				const body = angular.element(document).find('body').eq(0);
				const colors = ['red', 'green', 'blue', 'purple', 'brown', 'orange'];

				function popupElement(word) {

					const left = _.random(20, $window.innerWidth - 200, false);
					const top = _.random(100, $window.innerHeight - 100, false);
					const start = _.random(0, 3000, false);
					const end = _.random(3000, 6000, false);
					const wow = angular.element('<h1 class="doge doge-fade-in" ' +
						'style="left: ' + left + 'px; top: ' + top + 'px; ' +
						'color: ' + _.sample(colors) + ';">' + word + '</h1>');

					setTimeout(function () {
						body.append(wow);
						setTimeout(function () {
							wow.addClass('doge-fade-out');
							setTimeout(function () {
								wow.remove();
							}, 1000);
						}, end);
					}, start);
				}

				_.each(message.words, word => {
					popupElement(word);
				});

				showEmoticonAnimation(el, message.emoticon);
			});

			$rootScope.$on('userUpdated', updateMemberList);
			$rootScope.$on('visibilityShow', updateLastRead);

			function showEmoticonAnimation(el, emoticon) {
				const knownEmoticon = _.find(emoticons.files, function (known) {
					return known.replace(/\.\w{1,4}$/, '').toLowerCase() === emoticon.replace(/:/g, '').toLowerCase();
				});

				if (!knownEmoticon) return;

				const animationBox = angular.element(
					`<div class="animation-box closed" style="left: ${Math.random() * 60 + 20}%">` +
					`<img src="/assets/images/emoticons/${knownEmoticon}"/>` +
					`</div>`
				);

				el.append(animationBox);
				setTimeout(function () { // Put slide up on stack
					animationBox.removeClass('closed');
					setTimeout(function () { // Slide back down in 3 seconds
						animationBox.addClass('closed');
						setTimeout(function () { // Remove from DOM 1.5 seconds after requesting slide down
							el.remove(animationBox);
						}, 1500);
					}, 3000);
				});
			}

			function updateMemberList() {
				$scope.memberList = _($scope.current.$members)
					.sortBy(function (member) {
						const user = member.user;
						return (user.connected ? (user.$present ? '000' : '111') : '999') + user.nick.toLowerCase();
					})
					.value();
			}

			function updateLastRead() {
				if (!$scope.current.$selected || $scope.current.$messages.length === 0) return;

				const membership = _.find(bunkerData.memberships, {room: $scope.current._id});
				const lastReadId = _.last($scope.current.$messages)._id !== membership.lastReadMessage ? membership.lastReadMessage : null;

				el.find('.message.last-read').removeClass('last-read');
				if (lastReadId) {
					_.defer(function () {
						el.find('#' + lastReadId + ' .message').addClass('last-read');
					});
				}
			}
		}
	}
});

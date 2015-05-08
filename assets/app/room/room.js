app.directive('room', function ($rootScope, $state, bunkerData, emoticons) {
	return {
		scope: {
			roomId: '@room'
		},
		templateUrl: '/assets/app/room/room.html',
		link: function ($scope, $element) {

			$scope.user = bunkerData.user;
			$scope.settings = bunkerData.userSettings;

			bunkerData.$promise.then(function () {
				$scope.current = bunkerData.getRoom($scope.roomId);

				// Setup watches once we have data

				$scope.$watchCollection('current.$members', function (members) {
					if (!members) return;
					$scope.memberLookup = _.indexBy(members, function (roomMember) {
						return roomMember.user.id;
					});
				});

				updateMemberList();
			});

			$scope.openHistory = function () {
				$state.go('roomHistory', {roomId: $scope.roomId, date: moment().format('YYYY-MM-DD')});
			};
			$scope.mentionUser = function (userNick) {
				$rootScope.$broadcast('inputText', '@' + userNick);
			};
			$scope.loadPreviousMessages = function () {
				return bunkerData.loadMessages($scope.current, $scope.current.$messages.length);
			};

			$rootScope.$on('bunkerMessaged.animation', function (evt, message) {
				if (message.room.id == $scope.current.id) {

					var el = angular.element($element);
					var emoticon = (/:\w+:/.exec(message.text))[0];
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return known.replace(/\.\w{1,4}$/, '').toLowerCase() == emoticon.replace(/:/g, '').toLowerCase();
					});

					if (!knownEmoticon) return;

					var animationBox = angular.element(
						'<div class="animation-box closed" style="left: ' + (Math.random() * 60 + 20) + '%"><img src="/assets/images/emoticons/' + knownEmoticon + '"/></div>'
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
			});

			$rootScope.$on('userUpdated', updateMemberList);

			function updateMemberList() {
				$scope.memberList = _($scope.current.$members)
					.select(function (member) {
						// Don't show users who haven't logged in for awhile
						return moment().diff(member.user.lastConnected, 'days') < 45;
					})
					.sortBy(function (member) {
						var user = member.user;
						return (user.connected ? (user.$present ? '000' : '111') : '999') + user.nick.toLowerCase();
					})
					.value();
			}
		}
	}
});

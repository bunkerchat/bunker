app.directive('lobby', function ($rootScope, $state, bunkerData) {
	return {
		restrict: 'EA',
		templateUrl: '/assets/app/lobby/lobby.html',
		controllerAs: 'lobby',
		controller: function () {
			var self = this;

			bunkerData.$promise.then(init);

			this.joinRoom = function (roomId) {
				bunkerData.joinRoom(roomId)
					.then(function (room) {
						$state.go('chat.room', {roomId: room._id});
					});
			};

			this.createRoom = function (roomName) {
				bunkerData.createRoom(roomName)
					.then(function (room) {
						$state.go('chat.room', {roomId: room._id});
					});
			};

			$rootScope.$on('roomIdChanged', function (evt, roomId) {
				if (!roomId) {
					init();
				}
			});

			function init() {
				bunkerData.$promise.then(function () {
					self.rooms = bunkerData.rooms;
					_.each(self.rooms, function (room) {
						room.$lastMessage = _(room.$messages).filter({type: 'standard'}).last();
					});
				});
			}
		}
	};
});

app.filter('connectedUsersCount', function () {
	return function (members) {
		if (!members) return 0;
		return members.filter(function (member) {
			return member.user.connected;
		}).length;
	};
});

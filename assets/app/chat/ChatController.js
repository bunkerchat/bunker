app.controller('ChatController', function ($rootScope, bunkerData) {
	var self = this;

	this.rooms = bunkerData.rooms;

	bunkerData.$promise.then(selectRoom);
	$rootScope.$on('roomIdChanged', selectRoom);

	function selectRoom() {

		bunkerData.broadcastActiveRoom($rootScope.roomId);

		if (bunkerData.$resolved && $rootScope.roomId && !_.some(self.rooms, {_id: $rootScope.roomId})) {
			// Functionality to allow users to join a room by entering it's URL
			bunkerData.joinRoom($rootScope.roomId).then(function () {
				selectRoom();
			});
		}

		_.each(self.rooms, function (room) {
			room.$selected = room._id == $rootScope.roomId;
		});
	}
});

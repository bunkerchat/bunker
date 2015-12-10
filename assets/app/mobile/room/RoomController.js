app.controller('RoomController', function ($stateParams, bunkerData) {
	var self = this;

	this.user = bunkerData.user;
	this.settings = bunkerData.userSettings;

	bunkerData.$promise.then(function () {
		if (!_.any(bunkerData.rooms, {_id: $stateParams.roomId})) {
			// Functionality to allow users to join a room by entering it's URL
			bunkerData.joinRoom($stateParams.roomId).then(function () {
				self.current = bunkerData.getRoom($stateParams.roomId);
			});
		}
		else {
			self.current = bunkerData.getRoom($stateParams.roomId);
		}
	});
});

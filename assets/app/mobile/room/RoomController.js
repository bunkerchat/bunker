app.controller('RoomController', function ($stateParams, bunkerData) {
	var self = this;

	this.user = bunkerData.user;
	this.settings = bunkerData.userSettings;

	bunkerData.$promise.then(function () {
		self.current = bunkerData.getRoom($stateParams.roomId);
	});
});

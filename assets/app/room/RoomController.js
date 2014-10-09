app.controller('RoomController', function ($stateParams, rooms) {
	var roomId = $stateParams.roomId;

	this.current = rooms(roomId);
});

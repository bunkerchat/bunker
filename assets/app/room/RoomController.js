app.controller('RoomController', function ($state, $stateParams, bunkerApi, user) {
	this.room = bunkerApi.room.get({id:$stateParams.roomId}, function (room) {
		//user.rooms.push(room);
		//derpderp
	});
});

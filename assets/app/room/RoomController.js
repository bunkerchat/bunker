app.controller('RoomController', function ($stateParams, bunkerApi, user) {
	var roomId = $stateParams.roomId;
	this.room = bunkerApi.room.get({id: roomId}, function (room) {
		var existingMember = _.any(user.rooms, {id: roomId});
		if (!existingMember) {
			user.rooms.push(room);
		}
	});
});

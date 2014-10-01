app.controller('RoomController', function ($state, $stateParams, bunkerApi, user) {
	bunkerApi.room.get({id: $stateParams.roomId}, function (room) {
		var currentRoomMembers = room.members; // TODO combine with owners
		if (!_.any(currentRoomMembers, {id: user.id})) { // user is not a current member
			if (room.isPrivate) {
				// TODO prompt for code
				$state.go('lobby');
			}
			else {
				// join as a member
				room.members.push(user.id);
				room.$save(function () {
					user.rooms.push(room);
				});
			}
		}
	});
});
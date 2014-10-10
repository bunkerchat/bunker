app.controller('LobbyController', function ($state, bunkerApi, user) {

	this.user = user.current;

	this.joinRoom = function (roomName) {
		bunkerApi.room.get({name: roomName},
			function (room) {
				$state.go('room', {roomId: room.id});
			},
			function (error) {
				// TODO show error
			}
		);
	};
	this.createRoom = function (roomName) {
		var newRoom = new bunkerApi.room();
		newRoom.name = roomName;
		newRoom.$save(
			function (room) {
				$state.go('room', {roomId: room.id});
			},
			function (error) {
				// TODO show error
			});
	};
});

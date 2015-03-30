app.controller('LobbyController', function ($state, bunkerApi, bunkerData, rooms, user) {
	var self = this;

	this.bunkerData = bunkerData;

	bunkerData.$promise.then(function () {
		_.each(bunkerData.rooms, function (room) {
			console.log(room.name, room.members)
		})
	});

	this.joinRoom = function (roomGuid) {
		rooms.join(roomGuid).then(function (room) {
			$state.go('chat.room', {roomId: room.id});
		});
	};

	this.createRoom = function (roomName) {
		var newRoom = new bunkerApi.room({name: roomName});
		newRoom.$save(
			function (room) {
				$state.go('chat.room', {roomId: room.id});
			},
			function (error) {
				// TODO show error
			});
	};
});

app.filter('connectedUsersCount', function () {
	return function(members){
		if(!members) return 0;

		return members.filter(function (member) {
			return member.connected;
		}).length;
	}
});
app.controller('LobbyController', function ($state, bunkerData) {
	var self = this;

	bunkerData.$promise.then(function () {
		self.rooms = bunkerData.rooms;
	});

	this.joinRoom = function (roomId) {
		bunkerData.joinRoom(roomId)
			.then(function (room) {
				$state.go('chat.room', {roomId: room.id});
			});
	};

	this.createRoom = function (roomName) {
		bunkerData.createRoom(roomName)
			.then(function (room) {
				$state.go('chat.room', {roomId: room.id});
			});
	};
});

app.filter('connectedUsersCount', function () {
	return function(members){
		if(!members) return 0;
		return members.filter(function (member) {
			return member.user.connected;
		}).length;
	};
});

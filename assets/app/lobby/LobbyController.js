app.controller('LobbyController', function ($state, bunkerData) {
	var self = this;

	bunkerData.$promise.then(function () {
		self.rooms = bunkerData.rooms;
		_.each(self.rooms, function(room) {
			room.$lastMessage = _(room.$messages).filter({type: 'standard'}).last();
		});
	});

	this.joinRoom = function (roomId) {
		bunkerData.joinRoom(roomId)
			.then(function (room) {
				$state.go('chat.room', {roomId: room._id});
			});
	};

	this.createRoom = function (roomName) {
		bunkerData.createRoom(roomName)
			.then(function (room) {
				$state.go('chat.room', {roomId: room._id});
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

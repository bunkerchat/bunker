app.component('lobby', {
	templateUrl: '/assets/app/lobby/lobby.html',
	controllerAs: 'lobby',
	controller: 'lobbyController'
});

app.controller('lobbyController', function ($rootScope, $state, bunkerData) {
	var self = this;

	bunkerData.$promise.then(init);

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

	$rootScope.$on('roomIdChanged', function (evt, roomId) {
		if (!roomId) {
			init();
		}
	});

	function init() {
		bunkerData.$promise.then(function () {
			self.rooms = bunkerData.rooms;
			self.publicRooms = bunkerData.publicRooms;
			_.each(self.rooms, room => {
				room.$lastMessage = _(room.$messages).filter({type: 'standard'}).last();
				room.$lastMessage.topic = room.$lastMessage.text;
				delete room.$lastMessage.text
			});
		});
	}
});

app.filter('connectedUsersCount', function () {
	return function (members) {
		if (!members) return 0;
		return members.filter(function (member) {
			return member.user.connected;
		}).length;
	};
});

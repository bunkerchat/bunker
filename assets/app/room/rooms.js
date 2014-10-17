app.factory('rooms', function(bunkerApi) {
	var rooms = {};
	return function(roomId) {
		if(!rooms[roomId]) {
			rooms[roomId] = bunkerApi.room.get({id: roomId});
		}
		return rooms[roomId];
	};
});

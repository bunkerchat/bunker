app.factory('rooms', function(bunkerApi, user) {
	return function(roomId){
		var response = [];
		if(roomId){
			return bunkerApi.room.get({id: roomId});
		}
		else {
			user.current.$promise.then(function(userResponse){
				angular.copy(userResponse.rooms, response);
			});
		}

		return response;
	}
});
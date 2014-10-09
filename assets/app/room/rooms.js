app.factory('rooms', function(bunkerApi, user) {
	return function(roomId){
		var response = {};
		if(roomId){
			response = bunkerApi.room.get({id: roomId});
		}
		else {
			var userResponse = user.current;
			userResponse.$promise.then(function(){
				response = userResponse.rooms;
			});
		}

		return response;
	}
});
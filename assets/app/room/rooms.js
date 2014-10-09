app.factory('rooms', function($q, bunkerApi) {
	var allRooms = function(){
		var roomsPromise = $q.defer();
		bunkerApi.user.get({id: 'current'}, function(user){

			//Push all of the queries into an object
			var roomPromises = [];
			_.each(user.rooms, function(room){
				var roomPromise = $q.defer();

				bunkerApi.room.get({id: room.id}, function(room){
					roomPromise.resolve(room);
				});

				roomPromises.push(roomPromise.promise);
			});

			$q.all(roomPromises).then(function(rooms){
				var roomsObject = {};
				_.each(rooms, function(room){
					roomsObject[room.id] = room;
				});

				// this is what is returned to the user
				roomsPromise.resolve(roomsObject);
			});
		});

		return roomsPromise.promise;
	};

	return function(roomId){
		var returnRooms = {};

		allRooms().then(function(rooms){
			if(!roomId){
				angular.copy(rooms, returnRooms);
			}
			else{
				angular.copy(rooms[roomId], returnRooms);
			}
		});

		return returnRooms;
	};
});
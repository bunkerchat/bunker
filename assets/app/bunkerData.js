app.factory('bunkerData', function ($rootScope, $q) {

	// In the beginning...
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null
	};

	// Initial state and send us some starter data
	bunkerData.$promise = $q(function (resolve) {
		io.socket.get('/init', function (initialData) {

			_.each(initialData.rooms, function (room) {
				bunkerData.rooms.push(room);
			});
			delete initialData.rooms; // Already pushed, don't want to assign this

			_.assign(bunkerData, initialData); // Merge in the remaining data

			bunkerData.$resolved = true;
			resolve();
			$rootScope.$digest();
		});
	});

	// Handle events
	io.socket.on('room', function (evt) {
		switch (evt.verb) {
			case 'messaged': {
				var room = _.find(bunkerData.rooms, {id: evt.data.room.id});
				room.messages.push(evt.data);
				$rootScope.$digest();
				break;
			}
		}
	});

	return bunkerData;
});

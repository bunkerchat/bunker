app.factory('bunkerData', function ($rootScope, $q) {

	// In the beginning...
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null,
		joinRoom: function () {
			// TODO not finished
			io.socket.get('/api2/room/join', function (room) {
				room.$messages = room.$messages || [];
				bunkerData.rooms.push(room);
			});
		}
	};

	// Initial state and send us some starter data
	bunkerData.$promise = $q(function (resolve) {
		io.socket.get('/api2/init', function (initialData) {

			_.each(initialData.rooms, function (room) {
				bunkerData.rooms.push(room);
			});

			_.assign(bunkerData, _.omit(initialData, 'rooms')); // Merge in the remaining data

			bunkerData.$resolved = true;
			resolve();
			$rootScope.$digest();
		});
	});

	// Handle events
	io.socket.on('room', function (evt) {
		switch (evt.verb) {
			case 'messaged':
			{
				var room = _.find(bunkerData.rooms, {id: evt.data.room.id});

				if (!room) return; // TODO better handling of this scenario...
				if (!room.$messages) room.$messages = [];

				room.$messages.push(evt.data);
				$rootScope.$digest();
				break;
			}
		}
	});

	io.socket.on('roommember', function (evt) {
		switch (evt.verb) {
			case 'updated':
			{
				break;
			}
		}
	});

	return bunkerData;
});

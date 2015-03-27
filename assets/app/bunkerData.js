app.factory('bunkerData', function ($rootScope, $q) {

	// In the beginning...
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null,

		loadMessages: function(room, skip) {
			return $q(function(resolve) {
				io.socket.get('/room/' + room.id + '/messages?skip=' + skip || 0, function(messages) {
					room.$messages = room.$messages.concat(messages);
					decorateMessages(room);
					resolve();
				});
			})
		},
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
				var messages = room.$messages;
				room.$messages = [];
				_.each(messages, function (message) {
					addMessage(room, message);
				});

				bunkerData.rooms.push(room);
			});

			_.assign(bunkerData, _.omit(initialData, 'rooms')); // Merge in the remaining data

			bunkerData.$resolved = true;
			resolve();
			$rootScope.$digest();
		});
	});

	function addMessage(room, message) {
		var lastMessage = _.last(room.$messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		room.$messages.push(message);
	}

	function decorateMessages(room) {
		room.$messages = _.sortBy(room.$messages, 'createdAt'); // Resort messages
		_.each(room.$messages, function (message, index) {
			var lastMessage = index > 0 && index < room.$messages.length ? room.$messages[index - 1] : null;
			message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		});
	}

	// Handle events
	io.socket.on('room', function (evt) {
		switch (evt.verb) {
			case 'messaged':
			{
				var room = _.find(bunkerData.rooms, {id: evt.data.room.id});

				if (!room) return; // TODO better handling of this scenario...
				if (!room.$messages) room.$messages = [];
				addMessage(room, evt.data);

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

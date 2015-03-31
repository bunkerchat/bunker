app.factory('bunkerData', function ($rootScope, $q) {

	// In the beginning...
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null,

		loadMessages: function (room, skip) {
			return $q(function (resolve) {
				io.socket.get('/room/' + room.id + '/messages?skip=' + skip || 0, function (messages) {
					room.$messages = room.$messages.concat(messages);
					decorateMessages(room);
					resolve();
				});
			})
		},
		joinRoom: function (roomId) {
			return $q(function(resolve) {
				io.socket.post('/api2/room/' + roomId + '/join', function () {
					io.socket.get('/api2/room/' + roomId, function(room) {
						bunkerData.rooms.push(room);
						resolve();
					});
				});
			})
		},
		leaveRoom: function(roomId) {
			return $q(function(resolve) {
				io.socket.put('/room/' + roomId + '/leave', function() {
					resolve();
				});
			})
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

	function handleRoomEvent(evt) {
		var room = _.find(bunkerData.rooms, {id: evt.id});
		if (!room) throw new Error('Received a message from a room we did not know about: ' + JSON.stringify(evt));

		switch (evt.verb) {
			case 'messaged':
				if (!room.$messages) room.$messages = [];
				addMessage(room, evt.data);
				break;
			case 'updated':
				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var users = _(bunkerData.rooms).flatten('$members').pluck('user').filter({id: evt.id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, evt.data);
				});
				break;
		}
	}

	// Handle events
	var listeners = [
		{
			name: 'room',
			handler: handleRoomEvent
		},
		{
			name: 'user',
			handler: handleUserEvent
		}
	];

	_.each(listeners, function (listener) {
		io.socket.on(listener.name.toLowerCase(), function (evt) {
			// Ensure we have data back before responding to events
			bunkerData.$promise.then(function () {
				listener.handler(evt);
			});
		});
	});

	return bunkerData;
});

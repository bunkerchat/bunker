app.factory('bunkerData', function ($rootScope, $q) {

	// In the beginning...
	var roomLookup = [];
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null,

		init: function () {
			bunkerData.$resolved = false;
			return $q(function (resolve) {

				io.socket.get('/api2/init', function (initialData) {

					_.each(initialData.rooms, function (room) {
						var messages = room.$messages;
						room.$messages = [];
						_.each(messages, function (message) {
							bunkerData.addMessage(room, message);
						});

						bunkerData.rooms.push(room);
					});

					_.assign(bunkerData, _.omit(initialData, 'rooms')); // Merge in the remaining data
					roomLookup = _.indexBy(bunkerData.rooms, 'id');
					bunkerData.$resolved = true;

					resolve(bunkerData);
					$rootScope.$digest();
				});
			});
		},
		loadMessages: function (room, skip) {
			return $q(function (resolve) {
				io.socket.get('/room/' + room.id + '/messages?skip=' + skip || 0, function (messages) {
					room.$messages = room.$messages.concat(messages);
					decorateMessages(room);
					resolve(room);
				});
			});
		},
		clearOldMessages: function(id) {
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length < 40) return;

			// gets all but the last 60 messages
			var messagesToRemove = _.initial(roomLookup[id].$messages, 40);
			roomLookup[id].$messages = _.difference(roomLookup[id].$messages, messagesToRemove);
		},
		getRoom: function(id) {
			return roomLookup[id];
		},
		createRoom: function (roomName) {
			return $q(function (resolve) {
				io.socket.post('/room', {name: roomName}, function (room) {
					bunkerData.init().then(function () {
						resolve(room);
					});
				});
			});
		},
		joinRoom: function (roomId) {
			return $q(function (resolve) {
				io.socket.post('/api2/room/' + roomId + '/join', function () {
					bunkerData.init().then(function () {
						resolve(room);
					});
				});
			});
		},
		leaveRoom: function (roomId) {
			return $q(function (resolve) {
				io.socket.put('/api2/room/' + roomId + '/leave', function () {
					bunkerData.init().then(function () {
						resolve();
					});
				});
			});
		},
		addMessage: function addMessage(room, message) {
			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			room.$messages.push(message);
		}
	};

	function decorateMessages(room) {
		room.$messages = _.sortBy(room.$messages, 'createdAt'); // Resort messages
		_.each(room.$messages, function (message, index) {
			var lastMessage = index > 0 && index < room.$messages.length ? room.$messages[index - 1] : null;
			message.$firstInSeries = isFirstInSeries(lastMessage, message);
		});
	}

	function isFirstInSeries(lastMessage, message) {
		return !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
	}

	bunkerData.$promise = bunkerData.init();
	return bunkerData;
});

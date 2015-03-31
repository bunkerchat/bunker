app.factory('bunkerData', function ($rootScope, $q) {

	var roomLookup = []; // For fast room lookup
	var bunkerData = {
		user: null,
		rooms: [],
		$resolved: false,
		$promise: null,

		init: function () {
			bunkerData.$resolved = false;
			return $q(function (resolve) {

				io.socket.get('/api2/init', function (initialData) {

					// Clear rooms array
					while(bunkerData.rooms.length > 0) {
						bunkerData.rooms.pop();
					}

					_.each(initialData.rooms, function (room) {
						decorateMessages(room);
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
		createMessage: function(roomId, text) {
			return $q(function(resolve) {
				io.socket.post('/message', { room: roomId, text: text }, function(message) {
					resolve(message);
				});
			});
		},
		editMessage: function(message) {
			return $q(function(resolve) {
				io.socket.put('/message/' + message.id, message, function(message) {
					resolve(message);
				});
			});
		},
		loadMessages: function (room, skip) {
			return $q(function (resolve) {
				io.socket.get('/room/' + room.id + '/messages?skip=' + skip || 0, function (messages) {
					_.eachRight(messages, function(message) {
						room.$messages.unshift(message);
					});
					decorateMessages(room);
					resolve(room);
				});
			});
		},
		clearOldMessages: function(id) {
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length < 40) return;
			roomLookup[id].$messages = _.takeRight(roomLookup[id].$messages, 40);
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
				io.socket.post('/api2/room/' + roomId + '/join', function (room) {
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
		addMessage: function (room, message) {
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

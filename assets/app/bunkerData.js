app.factory('bunkerData', function ($rootScope, $q, $timeout) {

	var roomLookup = []; // For fast room lookup
	var typingTimeout;

	var bunkerData = {
		user: {},
		userSettings: {},
		rooms: [],
		$resolved: false,
		$promise: null,

		// Initial data, also sets up subscriptions

		init: function () {
			bunkerData.$resolved = false;
			return $q(function (resolve) {

				io.socket.get('/api2/init', function (initialData) {

					// Clear rooms array
					while (bunkerData.rooms.length > 0) {
						bunkerData.rooms.pop();
					}

					_.each(initialData.rooms, function (room) {
						decorateMessages(room);
						bunkerData.rooms.push(room);
					});

					_.assign(bunkerData.user, initialData.user);
					_.assign(bunkerData.userSettings, initialData.userSettings);

					roomLookup = _.indexBy(bunkerData.rooms, 'id');
					bunkerData.$resolved = true;

					resolve(bunkerData);
					$rootScope.$digest();
				});
			});
		},

		// Messages

		addMessage: function (room, message) {
			if (!bunkerData.userSettings.showNotifications && !message.author) return; // User does not want to see notifications

			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			room.$messages.push(message);
		},
		createMessage: function (roomId, text) {
			return $q(function (resolve) {
				io.socket.post('/message', {room: roomId, text: text}, function (message) {
					resolve(message);
				});
			});
		},
		editMessage: function (message) {
			return $q(function (resolve) {
				io.socket.put('/message/' + message.id, message, function (message) {
					resolve(message);
				});
			});
		},
		loadMessages: function (room, skip) {
			return $q(function (resolve) {
				io.socket.get('/room/' + room.id + '/messages?skip=' + skip || 0, function (messages) {
					_.eachRight(messages, function (message) {
						room.$messages.unshift(message);
					});
					decorateMessages(room);
					resolve(room);
				});
			});
		},
		clearOldMessages: function (id) {
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length < 40) return;
			roomLookup[id].$messages = _.takeRight(roomLookup[id].$messages, 40);
		},

		// Rooms

		getRoom: function (id) {
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

		// User

		broadcastTyping: function (roomId) {

			if (!bunkerData.$resolved) return; // Not ready yet

			if (bunkerData.user.typingIn != roomId) { // Only need to do anything if it's not already set
				bunkerData.user.typingIn = roomId;
				io.socket.put('/user/current/activity', {typingIn: roomId});
			}

			if (bunkerData.user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
				typingTimeout = $timeout(function () {
					bunkerData.user.typingIn = null;
					io.socket.put('/user/current/activity', {typingIn: null});
					typingTimeout = null;
				}, 2000);
			}
		},

		// UserSettings

		saveUserSettings: function() {
			io.socket.put('/usersettings/' + bunkerData.userSettings.id, bunkerData.userSettings);
		},
		toggleUserSetting: function(name) {
			bunkerData.userSettings[name] = !bunkerData.userSettings[name];
			bunkerData.saveUserSettings();
		},

		// Emoticons

		getEmoticonCounts: function () {
			return $q(function (resolve) {
				io.socket.get('/message/emoticoncounts', function (counts) {
					resolve(counts);
				});
			});
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

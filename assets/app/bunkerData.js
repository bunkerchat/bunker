app.factory('bunkerData', function ($rootScope, $q, $timeout, $notification, bunkerConstants) {

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

				io.socket.get('/init', function (initialData) {

					bunkerData.$resolved = true;
					_.assign(bunkerData.user, initialData.user);
					_.assign(bunkerData.userSettings, initialData.userSettings);

					// Set $resolved on all rooms (those not in the data set to false)
					// TODO ideally we could remove the rooms from the array entirely
					_.each(bunkerData.rooms, function (room) {
						room.$resolved = _.any(initialData.rooms, {id: room.id});
					});

					// Go through data and sync messages
					// Doing it this way keeps the rooms array intact so we don't disrupt the UI
					_.each(initialData.rooms, function (room) {
						var existing = _.find(bunkerData.rooms, {id: room.id});

						if (!existing) {
							room.$resolved = true;
							bunkerData.rooms.push(room);
						}
						else {
							existing.$resolved = true;

							_(room.$messages)
								.select(function (message) {
									return !_.any(existing.$messages, {id: message.id});
								})
								.each(function (newMessage) {
									existing.$messages.push(newMessage);
								})
								.value();
						}

						decorateMessages(room);
						decorateMembers(room);
					});

					roomLookup = _.indexBy(bunkerData.rooms, 'id');

					resolve(bunkerData);
					$rootScope.$digest();
				});
			});
		},

		connect: function () {
			io.socket.put('/user/current/connect');
		},

		// Messages

		addMessage: function (room, message) {
			if (!bunkerData.userSettings.showNotifications && !message.author) return; // User does not want to see notifications

			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			message.$editable = isEditable(message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			room.$messages.push(message);
		},
		createMessage: function (roomId, text) {
			return $q(function (resolve) {
				io.socket.post('/room/' + roomId + '/message', {text: text}, function (message) {
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
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length <= 40) return;
			roomLookup[id].$messages.splice(0, roomLookup[id].$messages.length - 40);
		},
		getHistoryMessages: function (roomId, startDate, endDate) {
			var url = '/room/' + roomId + '/history?startDate=' + startDate + '&endDate=' + endDate;
			return $q(function (resolve) {
				io.socket.get(url, function (messages) {
					resolve(messages);
				});
			});
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
				io.socket.post('/room/' + roomId + '/join', function (room) {
					bunkerData.init().then(function () {
						resolve(room);
					});
				});
			});
		},
		leaveRoom: function (roomId) {
			return $q(function (resolve) {
				io.socket.put('/room/' + roomId + '/leave', function () {
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

				bunkerData.cancelBroadcastTyping();
				typingTimeout = $timeout(function () {
					bunkerData.user.typingIn = null;
					io.socket.put('/user/current/activity', {typingIn: null});
					typingTimeout = null;
				}, 2000);
			}
		},
		broadcastPresent: function (present) {
			bunkerData.user.present = present;
			bunkerData.user.lastActivity = new Date().toISOString();
			io.socket.put('/user/current/activity', {
				typingIn: present ? bunkerData.user.typingIn : null,
				present: present
			});
		},
		cancelBroadcastTyping: function () {
			if (typingTimeout) $timeout.cancel(typingTimeout);
		},
		mentionsUser: function (text) {
			if(!bunkerData.$resolved) return false;
			var regex = new RegExp(bunkerData.user.nick + '\\b|@[Aa]ll', 'i');
			return regex.test(text);
		},

		// UserSettings

		saveUserSettings: function () {
			io.socket.put('/usersettings/' + bunkerData.userSettings.id, bunkerData.userSettings);
			$rootScope.$broadcast('userSettingsUpdated', bunkerData.userSettings);
		},
		toggleUserSetting: function (name, checkForNotifications) {
			bunkerData.userSettings[name] = !bunkerData.userSettings[name];
			bunkerData.saveUserSettings();

			if (checkForNotifications) {
				var hasRoomNotifications = _.any(bunkerData.memberships, function (membership) {
					return membership.showMessageDesktopNotification;
				});

				if (hasRoomNotifications || bunkerData.userSettings.desktopMentionNotifications) {
					$notification.requestPermission();
				}
			}
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
			message.$editable = isEditable(message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
		});
	}

	function decorateMembers(room) {
		_.each(room.$members, function(member) {
			member.user.$present = true; // assumed true for now
		});
	}

	function isFirstInSeries(lastMessage, message) {
		return !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
	}

	function isEditable(message) {
		return moment().diff(message.createdAt) < bunkerConstants.editWindowMilliseconds;
	}

	bunkerData.$promise = bunkerData.init();
	return bunkerData;
});

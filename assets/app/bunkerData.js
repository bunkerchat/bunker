app.factory('bunkerData', function ($rootScope, $q, $window, $timeout, $notification, bunkerConstants, emoticons) {

	var io = $window.io;
	var roomLookup = []; // For fast room lookup
	var typingTimeout;
	var resolveBunkerData$Promise;

	var bunkerData = {
		user: {},
		userSettings: {},
		rooms: [],
		inbox: [],
		memberships: [],
		$resolved: false,
		$promise: null,

		// Initial data, also sets up subscriptions
		start: function () {
			resolveBunkerData$Promise(bunkerData.init());
		},

		init: function () {
			bunkerData.$resolved = false;
			return $q(function (resolve) {

				io.socket.get('/init', function (initialData) {

					bunkerData.$resolved = true;
					decorateEmoticonCounts(initialData.emoticonCounts);
					_.assign(bunkerData.user, initialData.user);
					_.assign(bunkerData.userSettings, initialData.userSettings);
					_.assign(bunkerData.inbox, initialData.inbox);
					_.assign(bunkerData.memberships, initialData.memberships);

					bunkerData.inbox.unreadMessages = _.select(bunkerData.inbox, {read: false}).length;

					// Set $resolved on all rooms (those not in the data set to false)
					// TODO ideally we could remove the rooms from the array entirely
					_.each(bunkerData.rooms, function (room) {
						room.$resolved = _.any(initialData.rooms, {id: room.id});
					});

					// Go through data and sync messages
					// Doing it this way keeps the rooms array intact so we don't disrupt the UI
					_.each(initialData.rooms, function (roomData, index) {
						var room = _.find(bunkerData.rooms, {id: roomData.id});

						if (!room) {
							room = roomData;

							// Set the room tab order
							var membership = _.findWhere(bunkerData.memberships, {room: room.id});
							var roomIndex = _.has(membership, 'roomOrder') ? membership.roomOrder : index;
							setRoomOrder(roomIndex, room);
						}
						else {

							var existingMessagesLookup = _.indexBy(room.$messages, 'id');

							// Add on messages that were previously not in the list
							_.each(roomData.$messages, function (message) {
								if (!existingMessagesLookup[message.id]) {
									room.$messages.push(message);
								}
							});
						}

						room.$resolved = true;
						decorateMessages(room);
						decorateMembers(room);
					});

					// creates a hashmap of rooms by its id
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

			bunkerData.decorateMessage(room, message);

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
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length <= 100) return;
			roomLookup[id].$messages.splice(0, roomLookup[id].$messages.length - 100);
		},
		getHistoryMessages: function (roomId, startDate, endDate) {
			var url = '/room/' + roomId + '/history?startDate=' + startDate + '&endDate=' + endDate;
			return $q(function (resolve) {
				io.socket.get(url, function (messages) {
					resolve(messages);
				});
			});
		},
		decorateMessage: function (room, message) {
			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message.id + message.editCount;
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
			}

			bunkerData.cancelBroadcastTyping();
			typingTimeout = $timeout(function () {
				bunkerData.user.typingIn = null;
				io.socket.put('/user/current/activity', {typingIn: null});
				typingTimeout = null;
			}, 3000);
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
			if (!bunkerData.$resolved) return false;
			var regex = new RegExp(bunkerData.user.nick + '\\b|@[Aa]ll\\b', 'i');
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

		// RoomMember
		saveRoomMemberSettings: function (roomMembers) {
			var data = {roomMembers: roomMembers};
			io.socket.put('/roommember/updateSettings', data);
		},

		// Emoticons

		refreshEmoticonCounts: function () {
			return $q(function (resolve) {
				io.socket.get('/message/emoticoncounts', function (counts) {
					decorateEmoticonCounts(counts);
					resolve(counts);
				});
			});
		},

		// Inbox

		markInboxRead: function () {
			return $q(function (resolve) {
				io.socket.put('/user/current/markInboxRead', resolve);
			})
				.then(function (data) {
					_.each(bunkerData.inbox, function (inboxMessage) {
						inboxMessage.read = true;
					});
					bunkerData.inbox.unreadMessages = _.select(bunkerData.inbox, {read: false}).length;

					return data;
				});
		},

		clearInbox: function () {
			return $q(function (resolve) {
				bunkerData.inbox.length = 0;
				io.socket.put('/user/current/clearInbox', resolve);
			});
		}

	};

	function decorateMessages(room) {

		// Resort messages
		room.$messages = _.sortBy(room.$messages, function (message) {
			return moment(message.createdAt).unix();
		});

		_.each(room.$messages, function (message, index) {
			var previousMessage = index > 0 ? room.$messages[index - 1] : null;
			message.$firstInSeries = isFirstInSeries(previousMessage, message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message.id + message.editCount;
		});
	}

	function decorateMembers(room) {
		_.each(room.$members, function (member) {
			member.user.$present = true; // assumed true for now
		});
	}

	function isFirstInSeries(lastMessage, message) {
		return !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
	}

	function setRoomOrder(roomIndex, room) {
		// perhaps overkill, but check the room index has not already been set
		// trying to solve an edge case where joining a room might
		// clash with an already set room order
		if (bunkerData.rooms[roomIndex]) {
			var roomIndexUp = roomIndex + 1;
			return setRoomOrder(roomIndexUp, room);
		}

		// Add to known rooms
		bunkerData.rooms[roomIndex] = room;
	}

	function decorateEmoticonCounts(emoticonCounts) {
		var emoteCountsHash = _.indexBy(emoticonCounts, 'name');
		_.each(emoticons.list, function (emoticon) {
			emoticon.$count = emoteCountsHash[emoticon.name] ? emoteCountsHash[emoticon.name].count : 0;
		});
	}

	bunkerData.$promise = $q(function (resolve, reject) {
		resolveBunkerData$Promise = resolve;
	});

	return bunkerData;
});

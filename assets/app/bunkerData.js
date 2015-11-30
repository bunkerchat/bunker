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

		start: function () {
			// Call start once we are finished connecting (bunker.js)
			resolveBunkerData$Promise($q.all([
				bunkerData.connect(),
				bunkerData.init()
			]));
		},

		// Initial data, also sets up subscriptions
		init: function () {
			bunkerData.$resolved = false;
			return io.socket.emitAsync('/init').then(function (initialData) {
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
					room.$resolved = _.any(initialData.rooms, {_id: room._id});
				});

				// Go through data and sync messages
				// Doing it this way keeps the rooms array intact so we don't disrupt the UI
				_.each(initialData.rooms, function (roomData, index) {
					var room = _.find(bunkerData.rooms, {_id: roomData._id});

					if (!room) {
						room = roomData;

						// Set the room tab order
						var membership = _.findWhere(bunkerData.memberships, {room: room._id});
						var roomIndex = _.has(membership, 'roomOrder') ? membership.roomOrder : index;
						setRoomOrder(roomIndex, room);
					}
					else {

						var existingMessagesLookup = _.indexBy(room.$messages, '_id');

						// Add on messages that were previously not in the list
						_.each(roomData.$messages, function (message) {
							if (!existingMessagesLookup[message._id]) {
								room.$messages.push(message);
							}
						});
					}

					room.$resolved = true;
					decorateMessages(room);
					decorateMembers(room);
				});

				// creates a hashmap of rooms by its id
				roomLookup = _.indexBy(bunkerData.rooms, '_id');

				return bunkerData;
			});
		},

		connect: function () {
			return io.socket.emit('/user/current/connect');
		},

		// Messages

		addMessage: function (room, message) {
			if (!bunkerData.userSettings.showNotifications && !message.author) return; // User does not want to see notifications

			bunkerData.decorateMessage(room, message);

			room.$messages.push(message);
		},
		createMessage: function (roomId, text) {
			return io.socket.emitAsync('/room/message', {roomId: roomId, text: text});
		},

		// TODO: server side editMessage changes
		editMessage: function (message) {
			return io.socket.emitAsync('/message/edit', {messageId: message._id, message: message});
		},
		loadMessages: function (room, skip) {
			return io.socket.emitAsync('/room/messages', {roomId: room._id, skip: skip || 0})
				.then(function (messages) {
					_.eachRight(messages, function (message) {
						room.$messages.unshift(message);
					});
					decorateMessages(room);
					return room;
				});
		},
		clearOldMessages: function (id) {
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length <= 100) return;
			roomLookup[id].$messages.splice(0, roomLookup[id].$messages.length - 100);
		},
		// TODO: fix history
		//getHistoryMessages: function (roomId, startDate, endDate) {
		//	var url = '/room/' + roomId + '/history?startDate=' + startDate + '&endDate=' + endDate;
		//	return $q(function (resolve) {
		//		io.socket.emit(url, null, function (messages) {
		//			resolve(messages);
		//		});
		//	});
		//},
		decorateMessage: function (room, message) {
			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message._id + '_' + message.editCount;
		},

		// Rooms

		getRoom: function (id) {
			return roomLookup[id];
		},
		createRoom: function (roomName) {
			return io.socket.emitAsync('/room', {name: roomName}).then(reinit);
		},
		joinRoom: function (roomId) {
			return io.socket.emitAsync('/room/join', {roomId: roomId}).then(reinit);
		},
		leaveRoom: function (roomId) {
			return io.socket.emitAsync('/room/leave', {roomId: roomId}).then(reinit);
		},

		// User

		broadcastTyping: function (roomId) {
			if (!bunkerData.$resolved) return; // Not ready yet

			if (bunkerData.user.typingIn != roomId) { // Only need to do anything if it's not already set
				bunkerData.user.typingIn = roomId;
				io.socket.emit('/user/current/activity', {typingIn: roomId});
			}

			bunkerData.cancelBroadcastTyping();
			typingTimeout = $timeout(function () {
				bunkerData.user.typingIn = null;
				io.socket.emit('/user/current/activity', {typingIn: null});
				typingTimeout = null;
			}, 3000);
		},
		broadcastPresent: function (present) {
			bunkerData.user.present = present;
			bunkerData.user.lastActivity = new Date().toISOString();
			io.socket.emit('/user/current/activity', {
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
			io.socket.emit('/usersettings/save', {userSettingsId: bunkerData.userSettings._id, settings: bunkerData.userSettings});
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
			io.socket.emit('/roommember/updateSettings', {roomMembers: roomMembers});
		},

		// Emoticons

		refreshEmoticonCounts: function () {
			return io.socket.emitAsync('/message/emoticoncounts').then(decorateEmoticonCounts);
		},

		// Inbox

		markInboxRead: function () {
			return io.socket.emitAsync('/user/current/markInboxRead')
				.then(function (data) {
					_.each(bunkerData.inbox, function (inboxMessage) {
						inboxMessage.read = true;
					});
					bunkerData.inbox.unreadMessages = _.select(bunkerData.inbox, {read: false}).length;

					return data;
				});
		},

		clearInbox: function () {
			bunkerData.inbox.length = 0;
			return io.socket.emitAsync('/user/current/clearInbox');
		}
	};

	function reinit(data) {
		return bunkerData.init().then(function () {
			return data;
		});
	}

	function decorateMessages(room) {

		// Resort messages
		room.$messages = _.sortBy(room.$messages, function (message) {
			return moment(message.createdAt).unix();
		});

		_.each(room.$messages, function (message, index) {
			var previousMessage = index > 0 ? room.$messages[index - 1] : null;
			message.$firstInSeries = isFirstInSeries(previousMessage, message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message._id + '_' + message.editCount;
		});
	}

	function decorateMembers(room) {
		_.each(room.$members, function (member) {
			member.user.$present = true; // assumed true for now
		});
	}

	function isFirstInSeries(lastMessage, message) {
		return !lastMessage || !lastMessage.author || !message.author || lastMessage.author._id != message.author._id;
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

		return emoticonCounts
	}

	bunkerData.$promise = $q(function (resolve) {
		resolveBunkerData$Promise = resolve;
	});

	return bunkerData;
});

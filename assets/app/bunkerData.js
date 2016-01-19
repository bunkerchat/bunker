app.factory('bunkerData', function ($rootScope, $q, $window, $timeout, $notification, bunkerConstants, emoticons, $interval, pinBoard) {

	var io = $window.io;
	var roomLookup = []; // For fast room lookup
	var typingTimeout;
	var resolveBunkerData$Promise;
	var users = {};
	var lastActiveRoom;

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
				bunkerData.init()
			]));

			$timeout(bunkerData.refreshEmoticonCounts, 2000);
		},

		// Initial data, also sets up subscriptions
		init: function () {
			bunkerData.$resolved = false;
			return io.socket.emitAsync('/init').then(function (initialData) {
				bunkerData.$resolved = true;
				_.assign(bunkerData.user, initialData.user);
				_.assign(bunkerData.userSettings, initialData.userSettings);
				_.assign(bunkerData.inbox, initialData.inbox);
				_.assign(bunkerData.memberships, initialData.memberships);

				// instead of sending many duplicate users down, send one list
				// then re-hydrate all the associations
				users.length = 0;
				_.assign(users, _.indexBy(initialData.users, '_id'));

				_.each(bunkerData.inbox, function (inbox) {
					if (inbox.message.author) { // TODO causing a bug for @aSig for some reason without this
						inbox.message.author = users[inbox.message.author._id || inbox.message.author];
					}
				});

				_.each(bunkerData.memberships, function (membership) {
					membership.user = users[membership.user._id || membership.user];
				});

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
							if (existingMessagesLookup[message._id]) return;
							room.$messages.push(message);
						});

						// TODO: I think I need to overwrite the room's pinned messages with init data here D:
					}

					room.$resolved = true;
					decorateMessages(room);
					decorateMembers(room);
				});

				// gather up all initial pinned messages
				pinBoard.initialize(_.chain(initialData.rooms).map('$pinnedMessages').flatten().value());

				// creates a hashmap of rooms by its id
				roomLookup = _.indexBy(bunkerData.rooms, '_id');

				return bunkerData;
			});
		},

		// Messages

		addMessage: function (room, message) {
			// User does not want to see notifications
			if (!bunkerData.userSettings.showNotifications && !message.author) return;

			// we already have this message, please skip
			if (_.any(room.$messages, '_id', message._id)) return false;

			bunkerData.decorateMessage(room, message);

			room.$messages.push(message);
		},
		createMessage: function (roomId, text) {
			return io.socket.emitAsync('/room/message', {roomId: roomId, text: text});
		},

		editMessage: function (message) {
			return io.socket.emitAsync('/message/edit', {message: message});
		},
		loadMessages: function (room, skip) {
			return io.socket.emitAsync('/room/messages', {roomId: room._id, skip: skip || 0})
				.then(function (messages) {
					var existingMessagesLookup = _.indexBy(room.$messages, '_id');

					_.eachRight(messages, function (message) {
						if (existingMessagesLookup[message._id]) return;
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
		getHistoryMessages: function (roomId, startDate, endDate) {
			return io.socket.emitAsync('/room/history', {roomId: roomId, startDate: startDate, endDate: endDate});
		},
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

		broadcastActiveRoom: function (roomId) {
			if (lastActiveRoom == roomId) return;
			io.socket.emit('/user/current/activity', {room: roomId});
		},
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
			if (present == bunkerData.user.present) return;

			$timeout(function () {
				if (present == bunkerData.user.present) return;

				bunkerData.user.present = present;
				io.socket.emit('/user/current/activity', {
					typingIn: present ? bunkerData.user.typingIn : null,
					present: present
				});
			}, 5000);
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
			io.socket.emit('/usersettings/save', {
				userSettingsId: bunkerData.userSettings._id,
				settings: bunkerData.userSettings
			});
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
		},

		// ping
		ping: function () {
			io.socket.emit('/user/current/ping');
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

		var messageDecorator = function (message, index) {
			if (message.author) {
				message.author = users[message.author._id || message.author];
			}

			var previousMessage = index > 0 ? room.$messages[index - 1] : null;
			message.$firstInSeries = isFirstInSeries(previousMessage, message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message._id + '_' + message.editCount;
		};

		_.each(room.$messages, messageDecorator);
		_.each(room.$pinnedMessages, messageDecorator);
	}

	function decorateMembers(room) {
		_.each(room.$members, function (member) {
			member.user = users[member.user._id || member.user];
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
		_.each(emoticons.imageEmoticons, function (emoticon) {
			emoticon.$count = emoteCountsHash[emoticon.name] ? emoteCountsHash[emoticon.name].count : 0;
		});

		return emoticonCounts
	}

	bunkerData.$promise = $q(function (resolve) {
		resolveBunkerData$Promise = resolve;
	});

	$interval(bunkerData.ping, 10000); //ping every 10 seconds

	return bunkerData;
});

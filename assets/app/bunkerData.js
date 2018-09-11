app.factory('bunkerData', function ($rootScope, $q, $window, $timeout, $notification, bunkerConstants, emoticons, $interval, pinBoard, gravatarService) {

	var io = $window.io;
	var roomLookup = []; // For fast room lookup
	var typingTimeout;
	var resolveBunkerData$Promise;
	var users = {};
	var lastActiveRoom;

	var bunkerData = {
		connected: false,
		version: {},
		user: {},
		userSettings: {},
		rooms: [],
		publicRooms: [],
		inbox: [],
		memberships: [],
		$resolved: false,
		$promise: null,

		start: function () {
			// Call start once we are finished connecting (bunker.js)
			resolveBunkerData$Promise(bunkerData.init());
			$timeout(bunkerData.refreshEmoticonCounts, 2000);
		},

		// Initial data, also sets up subscriptions
		init: function () {
			bunkerData.$resolved = false;
			return io.socket.emitAsync('/init').then(function (initialData) {
				bunkerData.$resolved = true;
				delete bunkerData.version.old;
				bunkerData.version.old = _.clone(bunkerData.version);
				_.assign(bunkerData.version, initialData.version);
				_.assign(bunkerData.user, initialData.user);
				_.assign(bunkerData.userSettings, initialData.userSettings);
				_.assign(bunkerData.inbox, initialData.inbox);
				_.assign(bunkerData.memberships, initialData.memberships);

				_.each(initialData.users, user => {
					user.$present = bunkerData.isPresent(user);
					user.$gravatar = gravatarService.url(user.email, {s: 40});
				});

				// instead of sending many duplicate users down, send one list
				// then re-hydrate all the associations
				users = _.keyBy(initialData.users, '_id');

				_.each(bunkerData.inbox, function (inbox) {
					if (inbox.message.author) { // TODO causing a bug for @aSig for some reason without this
						inbox.message.author = users[inbox.message.author._id || inbox.message.author];
					}
				});

				_.each(bunkerData.memberships, function (membership) {
					membership.user = users[membership.user._id || membership.user];
				});

				bunkerData.inbox.unreadMessages = _.filter(bunkerData.inbox, {read: false}).length;

				// Set $resolved on all rooms (those not in the data set to false)
				// TODO ideally we could remove the rooms from the array entirely
				_.each(bunkerData.rooms, function (room) {
					room.$resolved = _.some(initialData.rooms, {_id: room._id});
				});

				// Go through data and sync messages
				// Doing it this way keeps the rooms array intact so we don't disrupt the UI
				_.each(initialData.rooms, function (roomData, index) {
					var room = _.find(bunkerData.rooms, {_id: roomData._id});

					if (!room) {
						room = roomData;

						// Set the room tab order
						var membership = _.find(bunkerData.memberships, {room: room._id});
						var roomIndex = _.has(membership, 'roomOrder') ? membership.roomOrder : index;
						setRoomOrder(roomIndex, room);
					}
					else {

						var existingMessagesLookup = _.keyBy(room.$messages, '_id');

						// Add on messages that were previously not in the list
						_.each(roomData.$messages, function (message) {
							if (existingMessagesLookup[message._id]) return;
							room.$messages.push(message);
						});

						// overwrite known room with messages from init response in event of reconnect
						room.$pinnedMessages = roomData.$pinnedMessages;
					}

					room.$resolved = true;
					decorateMessages(room);
					decorateMembers(room);
				});

				// gather up all initial pinned messages once rooms have been set up
				pinBoard.initialize(_.chain(bunkerData.rooms).map('$pinnedMessages').flatten().value());

				// creates a hashmap of rooms by its id
				roomLookup = _.keyBy(bunkerData.rooms, '_id');

				while (bunkerData.publicRooms.length) bunkerData.publicRooms.pop();
				_.each(initialData.publicRooms, room => bunkerData.publicRooms.push(room));

				$rootScope.$broadcast('bunkerDataLoaded');
				return bunkerData;
			});
		},

		// Messages

		addMessage: function (room, message) {
			// User does not want to see notifications
			if (!bunkerData.userSettings.showNotifications && !message.author) return;

			// we already have this message, please skip
			if (_.some(room.$messages, {'_id': message._id})) return false;

			bunkerData.decorateMessage(room, message);

			room.$messages.push(message);
		},
		createMessage: function (roomId, text) {
			return io.socket.emitAsync('/room/message', {roomId: roomId, text: text});
		},

		editMessage: function (message) {
			return io.socket.emitAsync('/message/edit', {message: message});
		},

		toggleReaction: (messageId, emoticonName) => {
			io.socket.emitAsync('/message/reaction', {messageId, emoticonName});
		},

		loadMessages: function (room, skip) {
			return io.socket.emitAsync('/room/messages', {roomId: room._id, skip: skip || 0})
				.then(function (messages) {
					var existingMessagesLookup = _.keyBy(room.$messages, '_id');

					_.eachRight(messages, function (message) {
						if (existingMessagesLookup[message._id]) return;
						room.$messages.unshift(message);
					});

					decorateMessages(room);
					return room;
				});
		},
		clearMessagesFromNick: function (roomId, nick) {
			if (!roomId || !roomLookup[roomId]) return;
			var room = roomLookup[roomId];

			$timeout(function () {
				_.each(room.$messages, function (message) {
					if ((!nick && !message.author) || (message.author && message.author.nick === nick)) {
						var hiddenMessage = _.cloneDeep(message);
						hiddenMessage.$hidden = true;
						hiddenMessage.editCount++;
						bunkerData.decorateMessage(room, hiddenMessage);

						var otherMessage = _.find(room.$messages, {_id: message._id});
						hiddenMessage.$firstInSeries = otherMessage.$firstInSeries;

						var index = _.indexOf(room.$messages, otherMessage);
						room.$messages.splice(index, 1, hiddenMessage);
					}
				});
			});
		},
		clearOldMessages: function (id) {
			if (!id || !roomLookup[id] || roomLookup[id].$messages.length <= 100) return;
			roomLookup[id].$messages.splice(0, roomLookup[id].$messages.length - 100);
		},
		getHistoryMessages: function (roomId, startDate, endDate) {
			return io.socket.emitAsync('/room/history', {roomId: roomId, startDate: startDate, endDate: endDate});
		},
		search: params =>{
			if(!params.query) return Promise.resolve()
			return io.socket.emitAsync('/search', params);
		},
		decorateMessage: function (room, message) {
			message.$firstInSeries = isFirstInSeries(_.last(room.$messages), message);
			message.$mentionsUser = bunkerData.mentionsUser(message.text);
			message.$idAndEdited = message._id + '_' + message.editCount;
			if (message.author) {
				message.author = users[message.author._id];
			}
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
			// don't set active room when bunker is reloaded by code
			if (lastActiveRoom == roomId || localStorage.bunkerReloaded) return;
			lastActiveRoom = roomId;
			io.socket.emitAsync('/user/current/activity', {room: roomId});
		},
		broadcastTyping: function (roomId) {
			if (!bunkerData.$resolved) return; // Not ready yet

			if (bunkerData.user.typingIn != roomId) { // Only need to do anything if it's not already set
				bunkerData.user.typingIn = roomId;
				io.socket.emitAsync('/user/current/typing', {typingIn: roomId});
			}

			bunkerData.cancelBroadcastTyping();
			typingTimeout = $timeout(function () {
				bunkerData.user.typingIn = null;
				io.socket.emitAsync('/user/current/typing', {typingIn: null});
				typingTimeout = null;
			}, 3000);
		},
		broadcastPresent: function (present) {
			if (present == bunkerData.user.present) return;

			$timeout(function () {
				if (present == bunkerData.user.present) return;

				bunkerData.user.present = present;
				io.socket.emitAsync('/user/current/present', {present});
			}, 250);
		},
		cancelBroadcastTyping: function () {
			if (typingTimeout) $timeout.cancel(typingTimeout);
		},
		mentionsUser: function (text) {
			if (!bunkerData.$resolved) return false;
			var regex = new RegExp(bunkerData.user.nick + '\\b|@[Aa]ll\\b', 'i');
			return regex.test(text);
		},

		isPresent: user => user.connected && !user.busy && user.present,

		// UserSettings

		saveUserSettings: function () {
			io.socket.emitAsync('/usersettings/save', {
				userSettingsId: bunkerData.userSettings._id,
				settings: bunkerData.userSettings
			});
			$rootScope.$broadcast('userSettingsUpdated', bunkerData.userSettings);
		},
		toggleUserSetting: function (name, checkForNotifications) {
			bunkerData.userSettings[name] = !bunkerData.userSettings[name];
			bunkerData.saveUserSettings();

			if (checkForNotifications) {
				var hasRoomNotifications = _.some(bunkerData.memberships, function (membership) {
					return membership.showMessageDesktopNotification;
				});

				if (hasRoomNotifications || bunkerData.userSettings.desktopMentionNotifications) {
					$notification.requestPermission();
				}
			}
		},

		// RoomMember
		saveRoomMemberSettings: function (roomMembers) {
			io.socket.emitAsync('/roommember/updateSettings', {roomMembers: roomMembers});
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
					bunkerData.inbox.unreadMessages = _.filter(bunkerData.inbox, {read: false}).length;

					return data;
				});
		},

		clearInbox: function () {
			bunkerData.inbox.length = 0;
			return io.socket.emitAsync('/user/current/clearInbox');
		},

		// ping
		ping: function () {
			io.socket.emitAsync('/user/current/ping');
		},

		// version
		isClientCodeCurrent: function () {
			if (!bunkerData.version.old.clientVersion) return true;
			return bunkerData.version.old.clientVersion == bunkerData.version.clientVersion;
		}
	};

	function reinit(data) {
		return bunkerData.init().then(() => data);
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
		_.each(_.map(room.$pinnedMessages, 'message'), messageDecorator);
	}

	function decorateMembers(room) {
		_.each(room.$members, function (member) {
			member.user = users[member.user._id || member.user];
		});

		_.remove(room.$members, member => !member.user);
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
		var emoteCountsHash = _.keyBy(emoticonCounts, 'name');
		_.each(emoticons.imageEmoticons, function (emoticon) {
			emoticon.$count = emoteCountsHash[emoticon.name] ? emoteCountsHash[emoticon.name].count : 0;
		});

		return emoticonCounts
	}

	bunkerData.$promise = $q(function (resolve) {
		resolveBunkerData$Promise = resolve;
	});

	$interval(bunkerData.ping, 10000); //ping every 10 seconds

	$interval(function () {
		//  if code is out of date and user is not present, reload the page
		if (!bunkerData.isClientCodeCurrent() && !bunkerData.user.present) {
			localStorage.bunkerReloaded = true;
			$window.location.reload();
		}
	}, 30000);

	// delete bunkerReloaded flag 10 seconds after app starts
	$timeout(function () {
		delete localStorage.bunkerReloaded;
	}, 10000);

	return bunkerData;
});

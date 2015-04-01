app.factory('rooms', function ($q, $rootScope, bunkerApi, user, uuid, $stateParams, notifications) {
	var rooms = {};
	var messageLookup = {};

	// Retrieve room from cache or request it from server
	// TODO this function as the join currently
	function getRoom(roomId) {

		if (!rooms[roomId]) {
			rooms[roomId] = bunkerApi.room.join({id: roomId}, function () {
				loadMessages(roomId, 0);
				rooms[roomId].$members = bunkerApi.roomMember.query({room: roomId});
			});
			rooms[roomId].$members = [];
			rooms[roomId].$messages = [];
			messageLookup[roomId] = {}; // create lookup table for this room
		}

		return rooms[roomId];
	}

	function loadMessages(roomId, skipAmount) {
		if (!rooms[roomId]) {
			throw 'Cannot load previous messages of an unknown room; fetch room first';
		}

		return bunkerApi.room.messages({id: roomId, skip: skipAmount}).$promise.then(function (messages) {
			_(messages).each(function (message) {
				addMessage(roomId, message);
			});

			rooms[roomId].$messages = _.sortBy(rooms[roomId].$messages, 'createdAt'); // Resort messages
			decorateMessages(rooms[roomId].$messages);
		});
	}

	function joinRoom(roomId) {
		var room = bunkerApi.room.join({id: roomId});

		room.$promise
			.catch(function (error) {
				// TODO error handling
				console.log('failed to join ' + roomId, error);
			});

		return room.$promise;
	}

	function leaveRoom(roomId) {
		// TODO need to retrieve before leaving? me thinks not
		var room = rooms[roomId];
		if (!room) {
			throw 'Tried to leave unknown room';
		}

		room.$leave(function () {
			delete messageLookup[roomId];
			delete rooms[roomId];
		});

		return room.$promise;
	}

	// Add a message
	function addMessage(roomId, message) {

		if (!message.id) {
			message.id = uuid.v4(); // All messages need ids
		}

		if (!rooms[roomId]) throw new Error('Received message from a room we are not a member of!');

		if (messageLookup[roomId][message.id]) return; // Message already exists!
		if (!user.settings.showNotifications && !message.author) return; // User does not want to see notifications

		var room = rooms[roomId];
		var lastMessage = _.last(room.$messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;

		room.$messages.push(message);
		messageLookup[roomId][message.id] = true; // Store messages in lookup object, this allows us to check for duplicates quickly

		notifications.newMessage(room, message);
	}

	function decorateMessages(messages) {
		_.each(messages, function (message, index) {
			var lastMessage = index > 0 && index < messages.length ? messages[index - 1] : null;
			message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		});
	}

	// Edit a message
	function editMessage(roomId, message) {
		var room = rooms[roomId];
		var currentMessage = _.find(room.$messages, {id: message.id});
		if (currentMessage) {
			angular.extend(currentMessage, message);
		}
	}

	function clearOldMessages(roomId) {
		if (!roomId || !rooms[roomId]) return;

		if (rooms[roomId].$messages.length < 40) return;

		// gets all but the last 60 messages
		var messagesToRemove = _.initial(rooms[roomId].$messages, 40);
		rooms[roomId].$messages = _.difference(rooms[roomId].$messages, messagesToRemove);

		_.each(messagesToRemove, function (message) {
			delete messageLookup[roomId][message.id];
		});
	}

	function handleRoomMessage(resource) {
		if (!resource.data.edited) {
			addMessage(resource.id, resource.data);
		}
		else {
			editMessage(resource.id, resource.data)
		}

		// if user is not in this room, remove history so when we tab switch its not slow
		if ($stateParams.roomId != resource.id) {
			clearOldMessages(resource.id);
		}
	}

	// message for a single user in a room (not seen by others)
	function handleRoomMemberMessage(resource){
		if (resource.data.user === user.current.id && resource.data.room === $stateParams.roomId){
			addMessage(resource.data.room, resource.data);
		}

	}

	// room change updates
	$rootScope.$on('roomIdChanged', function (evt, newId, oldId) {
		clearOldMessages(oldId);
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model === 'room') {
			handleRoomMessage(resource);
		} else if (resource.model === 'roommember') {
			handleRoomMemberMessage(resource);
		}
	});

	var disconnectMessages = [];

	// Handle disconnect
	$rootScope.$on('$sailsDisconnected', function () {
		_.each(rooms, function (room) {
			var message = {text: 'Disconnected', createdAt: new Date().toISOString()};
			disconnectMessages.push(message);
			addMessage(room.id, message);
		});
	});

	$rootScope.$on('$sailsConnected', function () {
		if (!disconnectMessages.length)return;
		_.each(disconnectMessages, function (message) {
			message.text = 'Connected';
		});
		disconnectMessages = [];
	});

	// Watch for socket.io updates to users
	// Apply changes to our list of users, if they are in this room
	$rootScope.$on('$sailsResourceUpdated', function (evt, resource) {
		if (resource.model == 'user') {
			_(rooms).flatten('$members').where({'user': {id: resource.id}}).each(function (roomMember) {
				angular.extend(roomMember.user, resource.data);
			});
		}
	});

	// auto subscribe to all rooms to be notified of messages
	user.memberships.$promise.then(function (memberships) {
		_.each(memberships, function (membership) {
			joinRoom(membership.room.id);
		});
	});

	return {
		get: getRoom,
		loadMessages: loadMessages,
		join: joinRoom,
		leave: leaveRoom,
		clearOldMessages: clearOldMessages
	};
});

app.factory('rooms', function ($rootScope, bunkerApi, uuid) {
	var rooms = {};
	var messageLookup = {};

	// Retrieve room from cache or request it from server
	// TODO this function as the join currently
	function getRoom(roomId) {

		if (!rooms[roomId]) {
			rooms[roomId] = bunkerApi.room.get({id: roomId}, function () {
				bunkerApi.room.latest({roomId: roomId}, function (messages) {
					_(messages).sortBy('createdAt').each(function (message) {
						addMessage(roomId, message);
					});
				});
			});
			rooms[roomId].$messages = [];
		}

		return rooms[roomId];
	}

	function joinRoom() {
		// TODO not in use, retrieval causes join
	}

	function leaveRoom(roomId) {
		// TODO need to retrieve before leaving? me thinks not
		var room = getRoom(roomId);
		room.$promise.then(function() {
			room.$leave(function() {
				delete rooms[roomId];
			});
		});
	}

	// Add a message
	function addMessage(roomId, message) {
		if (messageLookup[message.id]) return; // already exists!

		var room = getRoom(roomId);
		var lastMessage = _.last(room.$messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;

		room.$messages.push(message);
		messageLookup[message.id] = message.id; // Store messages in lookup object, this allows us to check for duplicates quickly
	}

	// Edit a message
	function editMessage(roomId, message) {
		var room = getRoom(roomId);
		var currentMessage = _.find(room.$messages, {id: message.id});
		if (currentMessage) {
			angular.extend(currentMessage, message);
		}
	}

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model != 'room') return;

		if (!resource.data.edited) {
			addMessage(resource.id, resource.data);
		}
		else {
			editMessage(resource.id, resource.data)
		}
	});

	// Handle disconnect
	$rootScope.$on('$sailsDisconnected', function () {
		_.each(rooms, function (room) {
			addMessage(room.id, {text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()})
		});
	});

	return {
		get: getRoom,
		join: joinRoom,
		leave: leaveRoom
	};
});

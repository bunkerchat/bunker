app.factory('rooms', function ($rootScope, bunkerApi, uuid) {
	var rooms = {};
	var messageLookup = {};

	// Lookup a room
	function retrieveRoom(roomId) {
		rooms[roomId] = bunkerApi.room.get({id: roomId});
		rooms[roomId].$messages = [];
		bunkerApi.room.latest({roomId: roomId}, function (messages) {
			_(messages).sortBy('createdAt').each(function (message) {
				addMessage(roomId, message);
			});
		});
	}

	// Add a message
	function addMessage(roomId, message) {
		if (messageLookup[message.id]) return; // already exists!

		var room = rooms[roomId];
		var lastMessage = _.last(room.$messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;

		room.$messages.push(message);
		messageLookup[message.id] = message.id; // Store messages in lookup object, this allows us to check for duplicates quickly
	}

	// Edit a message
	function editMessage(roomId, message) {
		var room = rooms[roomId];
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

	return function (roomId) {
		if (!rooms[roomId]) {
			retrieveRoom(roomId);
		}
		return rooms[roomId];
	};
});

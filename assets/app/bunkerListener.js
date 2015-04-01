app.factory('bunkerListener', function (bunkerData, $state, notifications) {

	function handleRoomEvent(evt) {
		var room = bunkerData.getRoom(evt.id);
		if (!room) throw new Error('Received a message from a room we did not know about: ' + JSON.stringify(evt));

		switch (evt.verb) {
			case 'messaged':
				var message = evt.data;
				if (message.edited) {
					var otherMessage = _.find(room.$messages, {id: message.id});
					if (otherMessage) {
						_.assign(otherMessage, message);
					}
				}
				else {
					if (!room.$messages) room.$messages = [];
					bunkerData.addMessage(room, message);
					notifications.newMessage(room, message);
				}
				break;
			case 'updated':
				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var users = _(bunkerData.rooms).pluck('$members').flatten().pluck('user').filter({id: evt.id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, evt.data);
				});
				break;
		}
	}

	function handleReconnect() {
		bunkerData.init().then(function () {
			$state.go($state.current, {}, {reload: true});
		});
	}

	// Handle events
	var listeners = [
		{name: 'room', handler: handleRoomEvent},
		{name: 'user', handler: handleUserEvent},
		// usersettings are only updated by the client and mirroring is off
		{name: 'reconnect', handler: handleReconnect}
	];

	return {
		init: function () {
			_.each(listeners, function (listener) {
				io.socket.on(listener.name.toLowerCase(), function (evt) {
					// Ensure we have data back before responding to events
					bunkerData.$promise.then(function () {
						listener.handler(evt);
					});
				});
			});
		}
	};
});

app.factory('bunkerListener', function (bunkerData) {

	function handleRoomEvent(evt) {
		var room = bunkerData.getRoom(evt.id);
		if (!room) throw new Error('Received a message from a room we did not know about: ' + JSON.stringify(evt));

		switch (evt.verb) {
			case 'messaged':
				var message = evt.data;
				if (message.edited) {
					var otherMessage = _.find(room.$messages, {id: message.id});
					if(otherMessage) {
						_.assign(otherMessage, message);
					}
				}
				else {
					if (!room.$messages) room.$messages = [];
					bunkerData.addMessage(room, evt.data);
				}
				break;
			case 'updated':
				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var users = _(bunkerData.rooms).flatten('$members').pluck('user').filter({id: evt.id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, evt.data);
				});
				break;
		}
	}

	// Handle events
	var listeners = [
		{
			name: 'room',
			handler: handleRoomEvent
		},
		{
			name: 'user',
			handler: handleUserEvent
		}
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

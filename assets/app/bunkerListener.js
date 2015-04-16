app.factory('bunkerListener', function ($rootScope, $window, $interval, bunkerData, $state, notifications) {

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
					$rootScope.$broadcast('bunkerMessaged', message);
				}
				break;
			case 'updated':
				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var userData = evt.data;
		var users = _(bunkerData.rooms).pluck('$members').flatten().pluck('user').filter({id: evt.id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, userData);
					user.$present = isPresent(user);
				});
				if (evt.id == bunkerData.user.id) {
					_.assign(bunkerData.user, userData);
					if (userData.typingIn == null) {
						bunkerData.cancelBroadcastTyping();
					}
				}
				$rootScope.$broadcast('userUpdated', userData);
				break;
		}
	}

	function handleMembershipEvent(evt) {
		var membership = _.find(bunkerData.memberships, {id: evt.id});
		switch (evt.verb) {
			case 'updated':
				_.assign(membership, evt.data);
				break;
			case 'messaged':
				var room = bunkerData.getRoom(evt.data.room.id);
				bunkerData.addMessage(room, evt.data);
				$rootScope.$broadcast('bunkerMessaged', evt.data);
				break;
		}
	}

	function handleVisibilityShow() {
		bunkerData.broadcastPresent(true);
	}

	function handleVisibilityHide() {
		bunkerData.broadcastPresent(false);
	}

	function handleConnect() {
		bunkerData.connect();
	}

	function handleReconnect() {
		bunkerData.init();
	}

	function handleClose() {
		io.socket.disconnect();
	}

	function isPresent(user) {
		return user.connected && !user.busy && (user.present || moment().diff(moment(user.lastActivity), 'minutes') < 5);
	}

	// Handle events
	var listeners = [
		{name: 'room', type: 'socket', handler: handleRoomEvent},
		{name: 'user', type: 'socket', handler: handleUserEvent},
		// usersettings are only updated by the client and mirroring is off
		{name: 'roomMember', type: 'socket', handler: handleMembershipEvent},
		{name: 'connect', type: 'socket', handler: handleConnect},
		{name: 'reconnect', type: 'socket', handler: handleReconnect},
		{name: 'visibilityShow', type: 'rootScope', handler: handleVisibilityShow},
		{name: 'visibilityHide', type: 'rootScope', handler: handleVisibilityHide},
		{name: 'onbeforeunload', type: 'window', handler: handleClose}
	];

	return {
		init: function () {
			_.each(listeners, function (listener) {
				if (listener.type == 'socket') {
					io.socket.on(listener.name.toLowerCase(), function (evt) {
						// Ensure we have data back before responding to events
						bunkerData.$promise.then(function () {
							listener.handler(evt);
						});
					});
				}
				else if (listener.type == 'rootScope') {
					$rootScope.$on(listener.name, function (evt) {
						bunkerData.$promise.then(function () {
							listener.handler(evt);
						});
					});
				}
				else if (listener.type == 'window') {
					$window[listener.name] = listener.handler;
				}
			});

			// Every 10 seconds, set user statuses
			$interval(function () {
				_(bunkerData.rooms).pluck('$members').flatten().pluck('user').each(function (user) {
					user.$present = isPresent(user);
				}).value();
			}, 10000);
		}
	};
});

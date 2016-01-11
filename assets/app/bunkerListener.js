app.factory('bunkerListener', function ($rootScope, $window, $document, $interval, bunkerData, $state, notifications) {

	function handleRoomEvent(evt) {
		var room = bunkerData.getRoom(evt._id);
		if (!room) throw new Error('Received a message from a room we did not know about: ' + JSON.stringify(evt));

		switch (evt.verb) {
			case 'messaged':
				var message = evt.data;
				if (message.edited) {
					bunkerData.decorateMessage(room, message);

					var otherMessage = _.find(room.$messages, {_id: message._id});
					message.$firstInSeries = otherMessage.$firstInSeries;

					var index = _.indexOf(room.$messages, otherMessage);
					room.$messages.splice(index, 1, message);
				}
				else {
					if (!room.$messages) room.$messages = [];
					bunkerData.addMessage(room, message);
					notifications.newMessage(room, message);
					$rootScope.$broadcast('bunkerMessaged', message);
					$rootScope.$broadcast('bunkerMessaged.' + message.type, message);
				}
				break;
			case 'updated':
				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var userData = evt.data;
		var users = _(bunkerData.rooms).pluck('$members').flatten().pluck('user').filter({_id: evt._id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, userData);
					user.$present = isPresent(user);
				});
				if (evt._id == bunkerData.user._id) {
					_.assign(bunkerData.user, userData);
					if (userData.typingIn == null) {
						bunkerData.cancelBroadcastTyping();
					}
				}
				$rootScope.$broadcast('userUpdated', userData);
				break;
			case 'messaged':
				$rootScope.$broadcast('userMessaged_' + userData.type, userData);
				break;
		}
	}

	function handleMembershipEvent(evt) {
		var membership = _(bunkerData.rooms).pluck('$members').flatten().filter({_id: evt._id}).first();
		switch (evt.verb) {
			case 'updated':
				_.assign(membership, evt.data);
				break;
			case 'messaged':
				var room = bunkerData.getRoom(evt.data.room._id);
				bunkerData.addMessage(room, evt.data);
				$rootScope.$broadcast('bunkerMessaged', evt.data);
				break;
		}
	}

	function handleUserMembershipEvent(evt) {
		var membership = _.find(bunkerData.memberships, {_id: evt._id});
		if (!membership) return;
		switch (evt.verb) {
			case 'updated':
				_.assign(membership, evt.data);
				break;
		}
	}

	function handleInboxEvent(evt) {
		switch (evt.verb) {
			case 'messaged':
				bunkerData.inbox.unshift(evt.data);
				bunkerData.inbox.unreadMessages++;
				break;
		}
	}

	function handleVisibilityShow() {
		var activeRoom = _.find(bunkerData.rooms, {$selected: true});
		if (activeRoom) {
			bunkerData.broadcastActiveRoom(activeRoom._id);
		}
		bunkerData.broadcastPresent(true);
	}

	function handleVisibilityHide() {
		bunkerData.broadcastActiveRoom(null);
		bunkerData.broadcastPresent(false);
	}

	function handleReconnect() {
		console.log('socket reconnected');
		bunkerData.init();
	}

	function handleDisconnect() {
		console.log('socket disconnected');
	}

	function isPresent(user) {
		return user.connected && !user.busy && user.present;
	}

	// Handle events
	var listeners = [
		{name: 'room', type: 'socket', handler: handleRoomEvent},
		{name: 'user', type: 'socket', handler: handleUserEvent},
		// usersettings are only updated by the client and mirroring is off
		{name: 'roommember', type: 'socket', handler: handleMembershipEvent},
		{name: 'user_roommember', type: 'socket', handler: handleUserMembershipEvent},
		{name: 'inboxMessage', type: 'socket', handler: handleInboxEvent},
		{name: 'reconnect', type: 'socket', handler: handleReconnect},
		{name: 'disconnect', type: 'socket', handler: handleDisconnect},
		{name: 'visibilityShow', type: 'rootScope', handler: handleVisibilityShow},
		{name: 'visibilityHide', type: 'rootScope', handler: handleVisibilityHide},
		{name: 'onload', type: 'window', handler: _.throttle(resetTimer, 5000)},
		{name: 'onmousemove', type: 'document', handler: _.throttle(resetTimer, 5000)},
		{name: 'onkeypress', type: 'document', handler: _.throttle(resetTimer, 5000)}
	];

	var awayTimeout;

	function resetTimer() {
		clearTimeout(awayTimeout);
		awayTimeout = setTimeout(handleVisibilityHide, 1000 * 60 * 10 /* 10 min */);
		handleVisibilityShow();
	}

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
				else if (listener.type == 'document') {
					$document[0][listener.name] = listener.handler;
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

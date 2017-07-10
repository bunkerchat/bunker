app.factory('bunkerListener', function ($rootScope, $window, $document, $interval, bunkerData, $state, notifications, pinBoard, gravatarService) {

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

					if(message.type === 'standard'){
						room.$lastMessage = _.cloneDeep(message);
						room.$lastMessage.topic = room.$lastMessage.text;
						delete room.$lastMessage.text;
					}

					$rootScope.$broadcast('bunkerMessaged', message);
					$rootScope.$broadcast('bunkerMessaged.' + message.type, message);
				}
				break;
			case 'updated':
				_.each(evt.data.$members, member => {
					member.user.$gravatar = gravatarService.url(member.user.email, {s: 20});
				});

				_.assign(room, evt.data);
				break;
		}
	}

	function handleUserEvent(evt) {
		var userData = evt.data;
		var users = _(bunkerData.rooms).map('$members').flatten().map('user').filter({_id: evt._id}).value();

		switch (evt.verb) {
			case 'updated':
				_.each(users, function (user) {
					_.assign(user, userData);
					user.$present = bunkerData.isPresent(user);
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
		var membership = _(bunkerData.rooms).map('$members').flatten().filter({_id: evt._id}).first();
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

	function handleMessagePin(event) {

		var room = bunkerData.getRoom(event.data.pinnedMessage.room);

		switch (event.verb) {
			case 'messaged':

				// If we are trying to pin the message, but it's already on the
				// pinboard, don't add it again.
				if (event.data.pinned && !pinBoard.isPinned(event.data.pinnedMessage.message._id)) {
					bunkerData.decorateMessage(room, event.data.pinnedMessage.message);

					room.$pinnedMessages.unshift(event.data.pinnedMessage);

					pinBoard.pinChanged(event.data);
				}
				else if (!event.data.pinned) {
					_.remove(room.$pinnedMessages, item => item.message._id === event.data.pinnedMessage.message._id);
					pinBoard.pinChanged(event.data);
				}

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

	function handleConnect(){
		console.log('socket connected - hello, world');
		bunkerData.connected = true;
		$rootScope.$broadcast('socketConnected');
	}

	function handleReconnect() {
		console.log('socket reconnected');
		bunkerData.init();
	}

	function handleDisconnect() {
		console.log('socket disconnected');
		bunkerData.connected = false;
		$rootScope.$broadcast('socketDisconnected');
	}

	// Handle events
	var listeners = [
		{name: 'room', type: 'socket', handler: handleRoomEvent},
		{name: 'user', type: 'socket', handler: handleUserEvent},
		// usersettings are only updated by the client and mirroring is off
		{name: 'roommember', type: 'socket', handler: handleMembershipEvent},
		{name: 'user_roommember', type: 'socket', handler: handleUserMembershipEvent},
		{name: 'inboxMessage', type: 'socket', handler: handleInboxEvent},
		{name: 'pinboard', type: 'socket', handler: handleMessagePin},
		{name: 'connect', type: 'socket', handler: handleConnect},
		{name: 'reconnect', type: 'socket', handler: handleReconnect},
		{name: 'disconnect', type: 'socket', handler: handleDisconnect},
		{name: 'visibilityShow', type: 'rootScope', handler: handleVisibilityShow},
		{name: 'visibilityHide', type: 'rootScope', handler: handleVisibilityHide},
		{name: 'onload', type: 'window', handler: _.throttle(resetTimer, 5000)},
		{name: 'onmousedown', type: 'document', handler: _.throttle(resetTimer, 5000)},
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
						bunkerData.$promise.then(() => listener.handler(evt));
					});
				}
				else if (listener.type == 'rootScope') {
					$rootScope.$on(listener.name, function (evt) {
						bunkerData.$promise.then(() => listener.handler(evt));
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
				_(bunkerData.rooms).map('$members').flatten().map('user').each(user => {
					user.$present = bunkerData.isPresent(user);
				});
			}, 10000);
		}
	};
});

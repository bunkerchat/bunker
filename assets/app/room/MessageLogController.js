/* global app, _ */

app.controller('MessageLogController', function ($rootScope, $stateParams, bunkerApi, uuid, user) {
	var self = this;
	var roomId = $stateParams.roomId;

	this.user = user.current;
	this.messages = [];

	bunkerApi.message.query({id: 'latest', roomId: roomId}, function (messages) {
		_(messages).sortBy('createdAt').each(function(message) {
			addMessage(message);
		});
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		switch (resource.model) {
			case 'room':
				if (resource.id === roomId && !resource.data.edited) {
					addMessage(resource.data);
				} else {
					editMessage(resource.data);
				}
				break;
			case 'user':
				addMessage(resource.data);
		}
	});

	$rootScope.$on('$sailsDisconnected', function (evt, data) {
		self.messages.push({text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()});
	});

	function addMessage(message) {
		var lastMessage = _.last(self.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;
		self.messages.push(message);
	}

	function editMessage(message) {
		// todo: learn underscore (I think)
		for (var i = 0; i < self.messages.length; i++){
			var currentMessage = self.messages[i];
			if (currentMessage.id == message.id) {
				currentMessage.text = message.text;
				currentMessage.history = message.history;
				currentMessage.edited = message.edited;
			}
		}
	}
});

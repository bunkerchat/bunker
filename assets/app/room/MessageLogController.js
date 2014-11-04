/* global app, _ */

app.controller('MessageLogController', function ($rootScope, $stateParams, bunkerApi, uuid, user) {
	var self = this;
	var roomId = $stateParams.roomId;
	var messageLookup = {};

	this.user = user.current;
	this.messages = [];

	bunkerApi.message.query({id: 'latest', roomId: roomId}, function (messages) {
		_(messages).sortBy('createdAt').each(function (message) {
			addMessage(message);
		});
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == roomId && !resource.data.edited) {
			addMessage(resource.data);
		} else {
			editMessage(resource.data)
		}
	});

	$rootScope.$on('$sailsDisconnected', function () {
		self.messages.push({text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()});
	});

	function addMessage(message) {
		if(messageLookup[message.id]) return; // already exists!

		var lastMessage = _.last(self.messages);
		message.$firstInSeries = !lastMessage || !lastMessage.author || !message.author || lastMessage.author.id != message.author.id;

		self.messages.push(message);
		messageLookup[message.id] = message.id; // Store messages in lookup object, this allows us to check for duplicates quickly
	}

	function editMessage(message) {
		var currentMessage = _.find(self.messages, {id: message.id});
		if (currentMessage) {
			angular.extend(currentMessage, message);
		}
	}
});

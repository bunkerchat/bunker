app.controller('MessageLogController', function ($rootScope, $stateParams, bunkerApi, user, uuid) {
	var self = this;

	this.user = user;
	bunkerApi.message.query({id: 'latest', roomId: $stateParams.roomId}, function (messages) {
		self.messages = _.sortBy(messages, 'createdAt');
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == $stateParams.roomId) {
			self.messages.push(resource.data);
		}
	});

	$rootScope.$on('$sailsDisconnected', function (evt, data) {
		self.messages.push({text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()});
	});

	this.members = rooms(roomId).members;
});

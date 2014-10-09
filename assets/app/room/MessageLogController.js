app.controller('MessageLogController', function ($rootScope, $stateParams, bunkerApi, rooms) {
	var self = this;

	var roomId = $stateParams.roomId;

	bunkerApi.message.query({id: 'latest', roomId: roomId}, function (messages) {
		self.messages = _.sortBy(messages, 'createdAt');
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == $stateParams.roomId) {
			self.messages.push(resource.data);
		}
	});

	this.members = rooms(roomId).members;
});

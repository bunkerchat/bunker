app.controller('MessageLogController', function ($rootScope, $stateParams, bunkerApi) {
	var self = this;
	bunkerApi.message.query({id: 'latest', roomId: $stateParams.roomId}, function (messages) {
		self.messages = _.sortBy(messages, 'createdAt');
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == $stateParams.roomId) {
			self.messages.push(resource.data);
		}
	});
});

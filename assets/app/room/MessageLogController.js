app.controller('MessageLogController', function($rootScope, $stateParams, bunkerApi) {
    var self = this;
	bunkerApi.message.query({id: 'latest', roomId: $stateParams.roomId}, function(messages) {
		self.messages = _.sortBy(messages, 'createdAt');
	});

	// Handle incoming messages
    $rootScope.$on('$sailsResourceCreated', function(evt, resource) {
        if(resource.model == 'message' && resource.data.room.id == $stateParams.roomId) {
            self.messages.push(resource.data);
        }
    });
});
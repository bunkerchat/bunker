app.controller('MessageLogController', function($rootScope, $stateParams, bunkerApi) {
    var self = this;
	this.messages = bunkerApi.message.query({roomId: $stateParams.roomId, sort: 'createdAt DESC', limit: 50});

	// Handle incoming messages
    $rootScope.$on('$sailsResourceCreated', function(evt, resource) {
        if(resource.model == 'message' && resource.data.roomId == $stateParams.roomId) {
            self.messages.push(resource.data);
        }
    });
});
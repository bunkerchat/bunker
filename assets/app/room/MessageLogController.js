app.controller('MessageLogController', function ($rootScope, $scope, $timeout, $stateParams, bunkerApi, uuid, rooms) {
	var self = this;
	var roomId = $stateParams.roomId;

	this.roomsService = rooms;
	this.messages = [];

	bunkerApi.message.query({id: 'latest', roomId: roomId}, function (messages) {
		self.messages = _.sortBy(messages, 'createdAt');
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == roomId) {
			self.messages.push(resource.data);
		}
	});

	$rootScope.$on('$sailsDisconnected', function (evt, data) {
		self.messages.push({text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()});
	});

});

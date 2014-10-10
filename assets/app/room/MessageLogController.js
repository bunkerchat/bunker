app.controller('MessageLogController', function ($rootScope, $scope, $timeout, $stateParams, bunkerApi, uuid, rooms) {
	var self = this;
	var roomId = $stateParams.roomId;

	this.roomsService = rooms;
	this.messages = [];

	bunkerApi.message.query({id: 'latest', roomId: roomId }, function (messages) {
		self.messages = _.sortBy(messages, 'createdAt');
		fixMessageUsers();
	});

	// Handle incoming messages
	$rootScope.$on('$sailsResourceMessaged', function (evt, resource) {
		if (resource.model == 'room' && resource.id == roomId) {
			self.messages.push(resource.data);
			fixMessageUsers();
		}
	});

	$rootScope.$on('$sailsDisconnected', function (evt, data) {
		self.messages.push({text: 'Disconnected', id: uuid.v4(), createdAt: new Date().toISOString()});
	});

	$rootScope.$on('$sailsConnected', function (evt, data) {
		$timeout(function(){
			fixMessageUsers();
		}, 1500);
	});

	function fixMessageUsers(){
		//Tie the authors of the messages to the onlineUsers (if they are online)
		if(self.roomsService && self.roomsService.current && self.roomsService.current.$resolved){
			// The timeout fixes a race condition with posting a message and it getting added to the messages list on
			// subscribed clients
			$timeout(function(){
				//filter out the server messages
				_.each(self.messages, function(message){
					if(message.author){

						var onlineUser = _.find(self.roomsService.current.members, function(item){
							return item.id == message.author.id;
						});

						if(onlineUser){
							message.author.lastActivity = onlineUser.lastActivity;
						}
					}
				});
			}, 200);
		}
	}
});

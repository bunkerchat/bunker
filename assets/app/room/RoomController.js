app.controller('RoomController', function ($scope, user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	this.mentionUser = function (userNick) {
		$scope.$broadcast('inputText', '@' + userNick);
	};

	$scope.$watch('room.current.members', function (newVal, oldVal) {
		if(!oldVal) return;
		self.memberLookup = _.indexBy(self.current.members, 'id');
	});

	$scope.$on('$sailsResourceUpdated', function(evt, resource) {
		if(resource.model == 'user') {
			var member = self.memberLookup[resource.id];
			if(member) {
				angular.extend(member, resource.data);
			}
		}
	});
});

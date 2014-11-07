app.controller('RoomController', function ($scope, bunkerApi, user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;
	this.roomMembers = bunkerApi.roomMember.query({room: currentRoom.id});

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	this.mentionUser = function (userNick) {
		$scope.$broadcast('inputText', '@' + userNick);
	};

	$scope.$watch('room.roomMembers', function (newVal, oldVal) {
		if(!oldVal) return;
		self.members = _.pluck(self.roomMembers, 'user');
		self.memberLookup = _.indexBy(self.members, 'id');
	}, true);

	$scope.$on('$sailsResourceUpdated', function(evt, resource) {
		if(resource.model == 'user') {
			var member = self.memberLookup[resource.id];
			if(member) {
				angular.extend(member, resource.data);
			}
		}
	});
});

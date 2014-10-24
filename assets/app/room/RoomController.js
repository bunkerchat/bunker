app.controller('RoomController', function ($scope, user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	$scope.$watch('room.current.members', function (newVal, oldVal) {
		if(!oldVal) return;
		self.memberLookup = _.indexBy(self.current.members, 'id');
	});
});

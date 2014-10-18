app.controller('RoomController', function (user, currentRoom) {
	var self = this;
	this.userService = user;
	this.current = currentRoom;

	this.now = function () {
		return moment().format('YYYY-MM-DD');
	};

	// Create lookup table
	// TODO get Jason to document how this works
	Object.defineProperty(self, 'memberLookup', {
		get: _.throttle(function () {
			return self.current ? _.indexBy(self.current.members, 'id') : {};
		}, 250)
	});
});

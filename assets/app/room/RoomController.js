app.controller('RoomController', function (user, rooms) {
	var self = this;

	//Most of this is setup in bunker.js resolve()
	this.userService = user;
	this.roomsService = rooms;
});

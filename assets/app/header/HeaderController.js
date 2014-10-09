app.controller('HeaderController', function (rooms, user) {
	this.rooms = rooms();
	this.user = user.current;
});

app.controller('HeaderController', function(bunkerApi) {
	this.rooms = bunkerApi.room.query();
});
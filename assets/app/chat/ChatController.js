app.controller('ChatController', function (bunkerData) {
	var self = this;

	this.rooms = bunkerData.rooms;

	bunkerData.$promise.then(function () {
		var room = _.first(self.rooms);
		room.selected = true;
	});
});

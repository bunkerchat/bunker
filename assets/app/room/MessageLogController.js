/* global app, _ */

app.controller('MessageLogController', function ($stateParams, user, rooms) {
	this.user = user.current;
	this.messages = rooms($stateParams.roomId).$messages;
});

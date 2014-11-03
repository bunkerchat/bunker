app.controller('HeaderController', function ($stateParams, $state, user, rooms, emoticons) {
	var self = this;
	this.user = user.current;
	this.settings = user.settings;
	this.emoticons = emoticons;

	this.changeSetting = function (setting) {
		self.settings[setting] = !self.settings[setting];
		self.settings.$save();
	};
	this.leaveRoom = function() {
		var room = rooms($stateParams.roomId);
		room.$leave(function() {
			$state.go('lobby');
		});
	};
});

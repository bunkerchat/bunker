app.controller('HeaderController', function ($stateParams, $state, user, emoticons) {
	var self = this;
	this.user = user.current;
	this.settings = user.settings;
	this.emoticons = emoticons;

	this.changeSetting = function (setting) {
		self.settings[setting] = !self.settings[setting];
		self.settings.$save();
	};
	this.leaveRoom = function() {
		self.user.rooms = _.reject(self.user.rooms, {id: $stateParams.roomId});
		self.user.$save(function() {
			$state.go('lobby');
		});
	};
});

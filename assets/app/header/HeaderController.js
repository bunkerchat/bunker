app.controller('HeaderController', function (user, emoticons) {
	var self = this;
	this.user = user.current;
	this.settings = user.settings;
	this.emoticons = emoticons;
	this.changeSetting = function (setting) {
		self.settings[setting] = !self.settings[setting];
		self.settings.$save();
	}
});

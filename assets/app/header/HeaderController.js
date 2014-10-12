app.controller('HeaderController', function (user, emoticons) {
	this.user = user.current;
	this.emoticons = emoticons;
});

app.controller('HeaderController', function (user, emoticons, $stateParams) {
	this.user = user.current;
	this.emoticons = emoticons;

	$http.put()
});

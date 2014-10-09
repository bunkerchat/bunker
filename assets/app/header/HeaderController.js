app.controller('HeaderController', function (user, emoticons) {
	this.user = user;
	this.emoticonLists = [
		_.initial(emoticons.files, emoticons.files.length/2),
		_.rest(emoticons.files, emoticons.files.length/2)
	];
});

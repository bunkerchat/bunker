app.factory('emoticons', function ($window) {
	var emoticons = $window.emoticons;

	var list = _.map(emoticons, function (emoticon) {
		return {name: emoticonName(emoticon), file: emoticon, isIcon: /^icon_/.test(emoticon), $count: 0};
	});

	return {
		all: list,
		imageEmoticons: _.filter(list, {isIcon: false}),
		names: _.map(list, 'name'),
		files: _.map(list, 'file')
	};
});

app.filter('emoticonName', function () {
	return emoticonName;
});

function emoticonName(input) {
	return input.replace(/\.\w+$/, '');
}

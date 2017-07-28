app.factory('emoticons', function ($window) {
	const emoticons = $window.emoticons;

	const list = _.map(emoticons, function (emoticon) {
		return {name: emoticonName(emoticon), file: emoticon, isIcon: /^fa-/.test(emoticon), $count: 0};
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

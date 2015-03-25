app.factory('emoticons', function ($window) {
	var files = $window.emoticons;

	var list = _.map(files, function (file) {
		return {name: emoticonName(file), file: file, $count: 0};
	});

	return {
		list: list,
		names: _.pluck(list, 'name'),
		files: _.pluck(list, 'file')
	};
});

app.filter("emoticonName", function () {
	return emoticonName;
});

function emoticonName(input) {
	return input.replace(/.\w+$/, '');
}

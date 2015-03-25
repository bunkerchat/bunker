var list = _.map(window.emoticons, function (file) {
	return {name: emoticonName(file), file: file, $count: 0};
});

var EmoticonStore = Reflux.createStore({

	list: list,

	hash: _.indexBy(list, 'name'),
	names: _.pluck(list, 'name'),
	files: _.pluck(list, 'file'),

	getState() {
		return {
			list: this.list,
			hash: this.hash,
			names: this.names,
			files: this.files
		}
	}
});

function emoticonName(input) {
	return input.replace(/.\w+$/, '');
}

module.exports = EmoticonStore;
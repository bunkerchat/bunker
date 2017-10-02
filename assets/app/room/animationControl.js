app.factory('animationControl', function () {
	function start(options) {
		options = options || {};
		options.elem = options.elem || $('body');

		options.elem.find('img[src$=".gif"]:visible').css('visibility', '');

		options.elem.find('video:visible')
			.css('visibility', '')
			.each((index, el) => el.play());
	}

	function stop(options) {
		options = options || {};
		options.elem = options.elem || $('body');

		options.elem.find(`img[src$=".gif"]${options.all ? '' : ':hidden'}`)
			.css('visibility', 'hidden');

		options.elem.find(`video${options.all ? '' : ':hidden'}`)
			.each((index, el) => el.pause())
			.css('visibility', 'hidden');
	}

	return {start, stop};
});

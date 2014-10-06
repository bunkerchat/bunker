app.factory('emoticons', function() {
	var files = [
		'allthethings.png',
		'arya.png',
		'badass.png',
		'dealwithit.gif',
		'doge.png',
		'eel.png',
		'fwp.png',
		'hodor.png',
		'indeed.png',
		'mindblown.gif',
		'notbad.png',
		'okay.png',
		'orly.png',
		'rageguy.png',
		'sadpanda.png',
		'stare.png',
		'successkid.png',
		'tableflip.png',
		'trollface.png',
		'wat.png'];

	return {
		names: _.map(files, function(file) { return file.replace(/.\w+$/, ''); }),
		files: files
	};
});
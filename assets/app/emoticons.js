app.factory('emoticons', function () {
	var files = [
		'3.gif',
		'allthethings.png',
		'argh.gif',
		'arya.png',
		'awthanks.png',
		'badass.png',
		'bahgawd.gif',
		'catdrugs.gif',
		'chompy.gif',
		'clint.gif',
		'dance.gif',
		'dealwithit.gif',
		'doge.png',
		'eel.png',
		'facepalm.gif',
		'frown.gif',
		'fwp.png',
		'fuuu.png',
		'hodor.png',
		'indeed.png',
		'mindblown.gif',
		'notbad.png',
		'okay.png',
		'orly.png',
		'parrot.gif',
		'rageguy.png',
		'sadpanda.png',
		'shrug.png',
		'smile.gif',
		'smith.gif',
		'stare.png',
		'successkid.png',
		'tableflip.png',
		'toot.gif',
		'trollface.png',
		'wat.png'];

	return {
		names: _.map(files, function (file) {
			return file.replace(/.\w+$/, '');
		}),
		files: files
	};
});
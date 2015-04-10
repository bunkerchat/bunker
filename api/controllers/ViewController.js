var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports.index = function (req, res) {
	var isProd = sails.config.environment === 'production';

	Promise.all([
		getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: req.session.userId})
	])
		.spread(function (emoticons, settings) {
			res.view(isProd ? 'index-prod' : 'index', {
				userId: req.session.userId,
				isProduction: isProd,
				emoticons: emoticons,
				loadingEmote: getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		});
};

module.exports.login = function (req, res) {
	res.view('login');
};

module.exports.login = function (req, res) {
	res.view('login');
};

function getEmoticonNamesFromDisk() {
	return fs.readdirAsync(path.join(__dirname, '..', '..', 'assets', 'images', 'emoticons'));
}

function getLoadScreenEmoticon() {
	return _.sample([
		'argh.gif',
		'bang.gif',
		'banjo.gif',
		'canofworms.gif',
		'clint.gif',
		'cop.gif',
		'cthulhu.gif',
		'dance.gif',
		'drinkup.gif',
		'duckhunt.gif',
		'f5.gif',
		'frogcool.gif',
		'golfclap.gif',
		'ghost.gif',
		'heythere.gif',
		'lightsabers.gif',
		'metal.gif',
		'munch.gif',
		'ninja.gif',
		'nyan.gif',
		'panic.gif',
		'pbjtime.gif',
		'rant.gif',
		'rolldice.gif',
		'science.gif',
		'woop.gif',
		'words.gif'
	]);
}

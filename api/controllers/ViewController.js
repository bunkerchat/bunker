var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');


module.exports.index = function (req, res) {
	var isProd = sails.config.environment === 'production';
	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: req.session.userId}),
		fs.readdirAsync(path.join(__dirname, '..', '..', 'assets', 'bundled')).catch(empty)
	)
		.spread(function (emoticons, settings, bundledFiles) {
			var templates = _.find(bundledFiles, function (file) {
				return _.includes(file, 'templates');
			});

			if(!isProd){
				templates = null;
			}

			res.view(isProd ? 'index-prod' : 'index', {
				templates: templates,
				userId: req.session.userId,
				isProduction: isProd,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		});
};

module.exports.indexDebug = function (req, res) {
	var isProd = sails.config.environment === 'production';
	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: req.session.userId})
	)
		.spread(function (emoticons, settings) {
			res.view('index-debug', {
				userId: req.session.userId,
				isProduction: isProd,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
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

function empty() {

}
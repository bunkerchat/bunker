var Promise = require('bluebird');

module.exports.index = function (req, res) {
	var isProd = sails.config.environment === 'production';

	Promise.all([
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: req.session.userId})
	])
		.spread(function (emoticons, settings) {
			res.view(isProd ? 'index-prod' : 'index', {
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
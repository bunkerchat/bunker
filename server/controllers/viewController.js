var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var config = require('./../config/config');
var UserSettings = require('./../models/UserSettings');
var emoticonService = require('./../services/emoticonService');

//module.exports.version = function (req, res) {
//	versionService.version()
//		.then(res.ok)
//		.catch(res.serverError);
//};

module.exports.index = function (req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	console.log('userId', userId)

	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: userId}),
		fs.readdirAsync('./assets/bundled').catch(empty)
	)
		.spread(function (emoticons, settings, bundledFiles) {
			//var templates = _.find(bundledFiles, function (file) {
			//	return _.includes(file, 'templates');
			//});

			// no template caching for dev
			//if (!config.useJavascriptBundle) {
			//	templates = null;
			//}

			var templates = null;
			var isProd = false;

			res.render(isProd ? 'index-prod' :'index', {
				templates: templates,
				userId: userId,
				isProduction: isProd,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		})
		.catch(res.serverError);
};

module.exports.login = function (req, res) {
	res.render('login');
};

module.exports.logout = function (req, res) {
	req.session.destroy();
	res.redirect('/login');
};

function empty() {

}

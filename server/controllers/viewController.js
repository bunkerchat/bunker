var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var config = require('./../config/config');

var emoticonService = require('./../services/emoticonService');

//module.exports.version = function (req, res) {
//	versionService.version()
//		.then(res.ok)
//		.catch(res.serverError);
//};

module.exports.index = function (req, res) {
	Promise.join(
		fs.readdirAsync('./assets/bundled').catch(empty),
		emoticonService.getEmoticonNamesFromDisk()
		//versionService.version()
	)
		.spread(function (bundledFiles, version) {
			//var templates = _.find(bundledFiles, function (file) {
			//	return _.includes(file, 'templates');
			//});

			// no template caching for dev
			//if (!config.useJavascriptBundle) {
			//	templates = null;
			//}


			res.render(isProd ? 'index-prod' : 'index', {
				//templates: templates,
				userId: req.session.userId,
				//isProduction: isProd,
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
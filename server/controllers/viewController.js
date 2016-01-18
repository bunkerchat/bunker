var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var config = require('./../config/config');
var UserSettings = require('./../models/UserSettings');
var emoticonService = require('./../services/emoticonService');

var viewController = module.exports;

viewController.index = function (req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: userId}),
		fs.readdirAsync('./assets/bundled').catch(_.noop)
	)
		.spread(function (emoticons, settings, bundledFiles) {
			var templates = _.find(bundledFiles, function (file) {
				return _.includes(file, 'templates');
			});

			//no template caching for dev
			if (!config.useJavascriptBundle) {
				templates = null;
			}

			res.render(config.useJavascriptBundle ? 'index-prod' : 'index', {
				templates: templates,
				userId: userId,
				useJavascriptBundle: config.useJavascriptBundle,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		})
		.catch(res.serverError);
};

viewController.debug = function (req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: userId})
	)
		.spread(function (emoticons, settings) {
			res.render('index', {
				templates: [],
				userId: userId,
				useJavascriptBundle: false,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		})
		.catch(res.serverError);
};

viewController.login = function (req, res) {
	res.render('login', {
		clientID: config.google.clientID
	});
};

viewController.loginBasic = function (req, res) {
	res.render('LoginBasic');
};

viewController.logout = function (req, res) {
	req.session.destroy();
	res.redirect('/login');
};

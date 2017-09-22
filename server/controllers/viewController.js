var Promise = require('bluebird');
//var fs = Promise.promisifyAll(require('fs'));
const request = require('request')

var config = require('../config/config');
var UserSettings = require('../models/UserSettings');
var emoticonService = require('../services/emoticonService');
var versionService = require('../services/versionService');

var viewController = module.exports;

viewController.index = function (req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	Promise.join(
		emoticonService.getEmoticonNamesFromDisk(),
		UserSettings.findOne({user: userId})
	)
		.spread(function (emoticons, settings) {
			res.render(config.useJavascriptBundle ? 'index-prod' : 'index', {
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

viewController.image = (req, res) => {
	if(!req.params.imgurl) return res.ok()
	req.pipe(request(decodeURIComponent(req.params.imgurl))).pipe(res)
}

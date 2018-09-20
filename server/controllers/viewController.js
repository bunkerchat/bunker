var Promise = require('bluebird');
//var fs = Promise.promisifyAll(require('fs'));
const request = require('request')
const sharp = require('sharp')

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

viewController.version2 = (req, res) => {
	res.render('v2', {
		config
	});
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
	if (!req.params.imgurl) return res.ok()

	const resize = sharp()
	// don't crash server on error
		.on('error', err => res.ok())
		.resize(400)

	let requestPipe = req.pipe(request(decodeURIComponent(req.params.imgurl)))

	if (req.query.small) {
		requestPipe = requestPipe.pipe(resize)
	}

	requestPipe.pipe(res)
}

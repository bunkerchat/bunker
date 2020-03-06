var Promise = require("bluebird");
//var fs = Promise.promisifyAll(require('fs'));
const request = require("request");
const sharp = require("sharp");
const path = require("path");

var config = require("../config/config");
var UserSettings = require("../models/UserSettings");
var emoticonService = require("../services/emoticonService");
var versionService = require("../services/versionService");

var viewController = module.exports;

const loadV1 = (req, res) => {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	Promise.join(emoticonService.getEmoticonNamesFromDisk(), UserSettings.findOne({ user: userId }))
		.spread(function(emoticons, settings) {
			res.render(config.useJavascriptBundle ? "index-prod" : "index", {
				userId: userId,
				useJavascriptBundle: config.useJavascriptBundle,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		})
		.catch(res.serverError);
};

const loadV2 = (req, res) => {
	res.sendFile("index.html", {
		root: path.join(process.cwd(), "build")
	});
};

viewController.index = function(req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	UserSettings.findOne({ user: userId }).then(settings => {
		if (settings.useV2) {
			loadV2(req, res);
		} else {
			loadV1(req, res);
		}
	});
};

viewController.version1 = (req, res) => {
	UserSettings.findOne({ user: req.session.userId })
		.then(settings => {
			settings.useV2 = false;
			return settings.save();
		})
		.then(() => {
			res.redirect("/");
		})
		.catch(res.serverError);
};


viewController.version2 = (req, res) => {
	UserSettings.findOne({ user: req.session.userId })
		.then(settings => {
			settings.useV2 = true;
			return settings.save();
		})
		.then(() => {
			res.redirect("/");
		})
		.catch(res.serverError);
};

viewController.debug = function(req, res) {
	var userId = _.isString(req.session.userId) ? req.session.userId.toObjectId() : req.session.userId;

	Promise.join(emoticonService.getEmoticonNamesFromDisk(), UserSettings.findOne({ user: userId }))
		.spread(function(emoticons, settings) {
			res.render("index", {
				userId: userId,
				useJavascriptBundle: false,
				emoticons: emoticons,
				loadingEmote: emoticonService.getLoadScreenEmoticon(),
				debugging: settings.showDebugging
			});
		})
		.catch(res.serverError);
};

viewController.login = function(req, res) {
	// If we don't have a userId and we haven't already made this loop, keep them here on the login page.
	const navigateToLoginPage = !req.session.userId && !req.session.loginRedirect;
	const { directTo } = req.query || {};

	if (navigateToLoginPage) {
		req.session.loginRedirect = false;
		res.render("login", { directTo });
	} else {
		req.session.loginRedirect = true;
		res.redirect(directTo ? directTo : "/");
	}
};

viewController.loginBasic = function(req, res) {
	res.render("LoginBasic");
};

viewController.logout = function(req, res) {
	req.session.destroy();
	res.redirect("/login");
};

viewController.image = (req, res) => {
	if (!req.params.imgurl) return res.ok();

	const resize = sharp()
		// don't crash server on error
		.on("error", err => res.ok())
		.resize(400);

	let requestPipe = req.pipe(request(decodeURIComponent(req.params.imgurl)));

	if (req.query.small) {
		requestPipe = requestPipe.pipe(resize);
	}

	requestPipe.pipe(res);
};

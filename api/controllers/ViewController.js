var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports.index = function (req, res) {
	getEmoticonNamesFromDisk().then(function (emoticons) {
		res.view('index', {
			userId: req.session.userId,
			isProduction: sails.config.environment === 'production',
			emoticons: emoticons
		});
	})
};

module.exports.react = function (req, res) {
	getEmoticonNamesFromDisk().then(function (emoticons) {
		res.view('react', {
			userId: req.session.userId,
			isProduction: sails.config.environment === 'production',
			emoticons: emoticons
		});
	})
};

module.exports.login = function (req, res) {
	res.view('login');
};

module.exports.login = function (req, res) {
	res.view('login');
};

function getEmoticonNamesFromDisk() {
	return fs.readdirAsync(path.join(__dirname, '..', '..','assets', 'images', 'emoticons'));
}
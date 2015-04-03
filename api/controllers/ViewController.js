var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports.index = function (req, res) {
	var isProd = sails.config.environment === 'production';
	getEmoticonNamesFromDisk().then(function (emoticons) {
		res.view(isProd ? 'index-prod' : 'index', {
			userId: req.session.userId,
			isProduction: isProd,
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
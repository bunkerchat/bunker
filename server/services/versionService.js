var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var git = require('git-rev');

var config = require('../config/config');

var versionService = module.exports;

var versionCache;

versionService.version = function version() {
	// cache version lookup info
	if (versionCache) return Promise.resolve(versionCache);

	var empty = function () {
	};

	return Promise.join(
		getGitBranchVersion(),
		fs.readFileAsync('./githash', {encoding: 'utf8'}).catch(empty)
	)
		.spread(function (gitBranchVersion, githash) {
			if (!githash) {
				githash = gitBranchVersion;
			}
			versionCache = {gitBranchVersion: gitBranchVersion, githash: githash};
			return versionCache;
		})
};

versionService.templates = function () {
	return getBundle()
		.then(bundledFiles => _.find(bundledFiles, file => _.includes(file, 'templates')));
};


var bundleCache;
function getBundle() {
	if (!config.useJavascriptBundle) return Promise.resolve([]);
	if (bundleCache) return Promise.resolve(bundleCache);

	return fs.readdirAsync('./assets/bundled')
		.then(bundledFiles => bundleCache = bundledFiles)
		// return empty when errors
		.catch(() => []);
}

function getGitBranchVersion() {
	return new Promise(function (resolve, reject) {
		git.branch(function (branch) {
			git.short(function (hash) {
				if (!hash) return resolve();
				resolve(branch + '/' + hash);
			});
		});
	});
}

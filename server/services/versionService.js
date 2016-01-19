var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var git = require('git-rev');

var config = require('../config/config');

var versionService = module.exports;

versionService.version = function version() {
	return Promise.join(
		getGitHash(),
		getClientCode(),
		getTemplate()
	)
		.spread((serverVersion, clientJavascriptFile, templateFile) => {
			var clientVersion;
			if(clientJavascriptFile) {
				clientVersion = /bundle-(.+?)\.js/gi.exec(clientJavascriptFile)[1];
			}

			if(templateFile) {
				clientVersion += /templates-(.+?)\.js/gi.exec(templateFile)[1];
			}

			return {serverVersion, clientVersion}
		});
};

versionService.templates = function () {
	return getBundle()
		// find the client side template
		.then(bundledFiles => _.find(bundledFiles, file => _.includes(file, 'templates')));
};

function getClientCode() {
	return getBundle()
		// find the client side bundle file
		.then(bundledFiles => _.find(bundledFiles, file => /bundle-.+?\.js/gi.test(file)));
}

function getTemplate(){
	return getBundle()
		// find the client side bundle file
		.then(bundledFiles => _.find(bundledFiles, file => /templates-.+?\.js/gi.test(file)));
}

var bundleCache;
function getBundle() {
	if (!config.useJavascriptBundle) return Promise.resolve([]);
	//if (bundleCache) return Promise.resolve(bundleCache);

	return fs.readdirAsync('./assets/bundled')
		.then(bundledFiles => bundleCache = bundledFiles)
		.catch(() => []);
}

var gitHashCache;
function getGitHash() {
	if (gitHashCache) return Promise.resolve(gitHashCache);
	return new Promise(resolve => git.short(hash => resolve(gitHashCache = hash)));
}

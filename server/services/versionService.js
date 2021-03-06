var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var git = require("git-rev");
var crypto = require("crypto");

var config = require("../config/config");
var emoticonService = require("./emoticonService");

var versionService = module.exports;

var versionCache;
versionService.version = function version() {
	if (versionCache) return Promise.resolve(versionCache);

	return Promise.join(
		getGitHash(),
		getClientCode(),
		getVendorCode(),
		getClientStyles(),
		emoticonService.getEmoticonNamesFromDisk(),
		getClientCodeV2(),
		getVendorCodeV2()
	).spread((serverVersion, clientFile, vendorFile, clientStyles, emoticons, clientFileV2, vendorFileV2) => {
		var clientVersion;
		if (clientFile) {
			clientVersion = /bundle-(.+?)\.js/gi.exec(clientFile)[1];
		}

		if (vendorFile) {
			clientVersion += /vendor-(.+?)\.js/gi.exec(vendorFile)[1];
		}

		if (clientStyles) {
			clientVersion += /default-(.+?)\.css/gi.exec(clientStyles)[1];
		}

		let clientVersionV2;
		if (clientFileV2) {
			clientVersionV2 = /main\.(.+?)\.js/gi.exec(clientFileV2)[1];
		}

		if (vendorFileV2) {
			clientVersionV2 += /vendor-\.(.+?)\.js/gi.exec(vendorFileV2)[1];
		}

		// hash emoticon names onto list as well
		clientVersion += crypto
			.createHash("md5")
			.update(emoticons.join())
			.digest("hex");

		clientVersionV2 += crypto
			.createHash("md5")
			.update(emoticons.join())
			.digest("hex");

		versionCache = { serverVersion, clientVersion, clientVersionV2 };
		return versionCache;
	});
};

function getClientCode() {
	return (
		getBundle()
			// find the client side bundle file
			.then(bundledFiles => _.find(bundledFiles, file => /bundle-.+?\.js/gi.test(file)))
	);
}

function getVendorCode() {
	return (
		getBundle()
			// find the client side bundle file
			.then(bundledFiles => _.find(bundledFiles, file => /vendor-.+?\.js/gi.test(file)))
	);
}

function getClientStyles() {
	return (
		getBundle()
			// find the client side bundle file
			.then(bundledFiles => _.find(bundledFiles, file => /default-.+?\.css/gi.test(file)))
	);
}

function getClientCodeV2() {
	return getBundleV2().then(bundledFiles => _.find(bundledFiles, file => /main\..+?\.js/gi.test(file)));
}

function getVendorCodeV2() {
	return getBundleV2().then(bundledFiles => _.find(bundledFiles, file => /vendor-\..+?\.js/gi.test(file)));
}

var bundleCache;
function getBundle() {
	if (!config.useJavascriptBundle) return Promise.resolve([]);
	if (bundleCache) return Promise.resolve(bundleCache);

	return fs
		.readdirAsync("./assets/bundled")
		.then(bundledFiles => (bundleCache = bundledFiles))
		.catch(() => []);
}

let bundleCacheV2;
function getBundleV2() {
	if (bundleCacheV2) return Promise.resolve(bundleCacheV2);

	return fs
		.readdirAsync("./dist")
		.then(bundledFiles => {
			bundleCacheV2 = bundledFiles.filter(file => !file.includes(".map"));
			return bundleCacheV2;
		})
		.catch(() => []);
}

versionService.getBundleV2 = getBundleV2;

var gitHashCache;
function getGitHash() {
	if (gitHashCache) return Promise.resolve(gitHashCache);
	return new Promise(resolve => git.short(hash => resolve((gitHashCache = hash))));
}

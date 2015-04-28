var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports.getEmoticonNamesFromDisk = function () {
	return fs.readdirAsync(path.join(__dirname, '..', '..', 'assets', 'images', 'emoticons'));
};

module.exports.getLoadScreenEmoticon = function () {
	return _.sample([
		'argh.gif',
		'bang.gif',
		'banjo.gif',
		'canofworms.gif',
		'clint.gif',
		'cop.gif',
		'cthulhu.gif',
		'dance.gif',
		'drinkup.gif',
		'duckhunt.gif',
		'f5.gif',
		'frogcool.gif',
		'golfclap.gif',
		'ghost.gif',
		'lightsabers.gif',
		'metal.gif',
		'munch.gif',
		'ninja.gif',
		'nyan.gif',
		'rant.gif',
		'rolldice.gif',
		'science.gif',
		'woop.gif',
		'words.gif'
	]);
}
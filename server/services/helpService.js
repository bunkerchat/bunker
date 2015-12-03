var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var helpDir = './api/services/help/';

var helpService = module.exports;

helpService.getHelp = function (input) {

	var match = input.match(/\/help (.*)/);
	if (match && match.length) {
		var command = match[1];
		return this.readHelpFile(command + '.txt');
	}
	return this.readHelpFile('basic.txt');
};

helpService.readHelpFile = function (fileName) {
	return fs.readFileAsync(helpDir + fileName, 'utf-8')
		.then(function (data) {
			return '<pre>' + data + '</pre>'; // ew, markup on server
		})
		.catch(function () {
			return helpService.readHelpFile('basic.txt');
		});
};

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var helpDir = "./server/services/help/";

var helpService = module.exports;

helpService.getHelp = function(input) {
	var match = input.match(/\/help (.*)/);
	if (match && match.length) {
		var command = match[1];
		return readHelpFile(command + ".txt");
	}
	return readHelpFile("basic.txt");
};
var count = 0;
function readHelpFile(fileName) {
	return fs
		.readFileAsync(helpDir + fileName, "utf-8")
		.then(data => `<pre>${data}</pre>`)
		.catch(() => readHelpFile("basic.txt"));
}

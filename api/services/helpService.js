var fs = require('fs');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

var helpDir = './api/services/help/';

module.exports = {
	getHelp: function (input) {

		var arr = input.match(/\/help (.*)/);
		if (arr != null && arr.length > 1) {
			var command = arr[1];
			if (command === 'nick') {
				return this.readHelpFile('nick.txt');
			} else if (command === "me") {
				return this.readHelpFile('me.txt');
			} else if (command === "roll") {
				return this.readHelpFile('roll.txt');
			} else if (command === "topic") {
				return this.readHelpFile('topic.txt');
			} else if (command === "images") {
				return this.readHelpFile('images.txt');
			} else if (command === "gravatar") {
				return this.readHelpFile('gravatar.txt');
			}
		}
		return this.readHelpFile('basic.txt');
	},
	readHelpFile: function (fileName) {
		return fs.readFileAsync(helpDir + fileName, 'utf-8')
			.then(function (data) {
				return data;
			});
	}
};

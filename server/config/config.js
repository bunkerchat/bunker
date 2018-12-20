var _ = require("lodash");

// check the command line options for a -env=someEnvironment
var environment = _(process.argv)
	.map(function(item) {
		// unfortunately mocha mangles the env=something, so using regex to check both
		// ex:
		// -env-integration-testing
		// -env=integration-testing
		var match = /-env(?:-|=)((?:\w|-)+)/gi.exec(item);
		if (match && match[1]) {
			return match[1];
		}
	})
	.compact()
	.first();

environment = environment || process.env.NODE_ENV || "development";

var config = require("./env/" + environment);

config.isLocal = function(req) {
	return (
		req.connection.remoteAddress === "127.0.0.1" ||
		req.connection.remoteAddress === "::1" ||
		req.connection.remoteAddress === "::ffff:127.0.0.1" ||
		config.environment == "integration-testing"
	);
};

module.exports = config;

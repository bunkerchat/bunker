var winston = require("winston");
var moment = require("moment");
//var Elasticsearch = require( 'winston-elasticsearch' );
var config = require("./config");
var os = require("os");

function now() {
	return moment().format();
}

//Elasticsearch.prototype.name = 'elasticsearch'; //name so we can refer to it later

module.exports = new winston.Logger({
	transports: [
		new winston.transports.Console({
			level: config.consoleLogLevel,
			colorize: true,
			timestamp: now,
			prettyPrint: true
		})
		//new Elasticsearch({
		//	level: 'info',
		//	source: os.hostname(),
		//	indexName: 'minos-carrier-' + (config.environment || 'develop'),
		//	host: config.elasticSearchLog.host,
		//	port: config.elasticSearchLog.port,
		//	disable_fields: true
		//})
	]
});

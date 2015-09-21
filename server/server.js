// set globals
//global.log = require('./config/log');
global.log = require('./config/log');
global._ = require('lodash');
global.Promise = require('bluebird');

var mongoose = require('mongoose');

var app = Promise.promisifyAll(require('./config/express'));
var config = require('./config/config');
//var db = require('./config/db');
//var seed = require('./seed');

//var migrations = require('./config/migrations');
//var indexes = require('./config/indexes');
//var minosEvents = require('./config/minosEvents');

module.exports.run = function (cb) {

	log.info('server - Starting "' + config.environment + '"');

	connectToMongoose()
		//.then(indexes.run)
		//.then(seed.run)
		//.then(migrations.run)
		//.then(minosEvents.configure)
		.then(function () {
			//if (config.useSSL) {
			//	return https.createServer(config.serverOptions, app).listenAsync(config.express.port);
			//}
			return app.listenAsync(config.express.port);
		})
		.then(function () {
			log.info('server - hosted - http://' + config.express.ip + ':' + config.express.port);
		})
		.then(cb)
		.catch(function (error) {
			return log.error('server - Error while starting', error);
		});
};

function connectToMongoose() {
	return new Promise(function (resolve, reject) {
		var url = "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name;
		mongoose.connect(url);
		mongoose.connection.once('open', function (err) {
			if (err) return reject(err);
			resolve();
		});
	});
}
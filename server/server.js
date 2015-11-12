// set globals
//global.log = require('./config/log');
global.log = require('./config/log');
global._ = require('lodash');
global.Promise = require('bluebird');

var mongoose = require('mongoose');

String.prototype.toObjectId = function() {
	var ObjectId = mongoose.Types.ObjectId;
	return new ObjectId(this.toString());
};

var config = require('./config/config');
var app = Promise.promisifyAll(require('./config/express'));
var server = Promise.promisifyAll(require('http').Server(app));
var socketio = require('./config/socketio');

var User = require('./models/User');
var Room = require('./models/Room');

module.exports.run = function (cb) {

	log.info('server - Starting "' + config.environment + '"');

	connectToMongoose()
		//.then(indexes.run)
		//.then(seed.run)
		//.then(migrations.run)
		//.then(minosEvents.configure)
		.then(startup)
		.then(function () {
			//if (config.useSSL) {
			//	return https.createServer(config.serverOptions, app).listenAsync(config.express.port);
			//}

			socketio.connect(server);
			//return server.listenAsync(config.express.port);
			server.listenAsync(config.express.port);
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

function startup(){
	return Promise.join(
		clearSocketsAndConnected(),
		ensureFirstRoom()
	)
}

function clearSocketsAndConnected(){
	return new Promise(function (resolve, reject) {
		User.update({}, {sockets: [], connected: false, typingIn: null}, { multi: true },  function (err, result) {
			if(err)return reject(err);
			resolve();
		})
	})
}

function ensureFirstRoom() {
	return Room.findOne({name: 'First'})
		.then(function (firstRoom) {
			if (!firstRoom) return Room.create({name: 'First'});
		})
}

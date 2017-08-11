// set globals
global.log = require('./config/log');
global._ = require('lodash');
global.Promise = require('bluebird');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

String.prototype.toObjectId = function() {
	var ObjectId = mongoose.Types.ObjectId;
	return new ObjectId(this.toString());
};

// allows you to push multiple arrays onto another array
// ex:
// var foo = []
// foo.pushAll([1,2,3],[4,5,6])
Array.prototype.pushAll = function () {
	this.push.apply(this, this.concat.apply([], arguments));
};

var config = require('./config/config');
var app = Promise.promisifyAll(require('./config/express'));
var server = Promise.promisifyAll(require('http').Server(app));
var socketio = require('./config/socketio');

var httpProxy = require('http-proxy');
var url = require('url');

var User = require('./models/User');
var Room = require('./models/Room');

module.exports.run = function (cb) {

	log.info('server - Starting "' + config.environment + '"');

	connectToMongoose()
		.then(startup)
		.then(function () {

			// quite possibly the hackiest thing ever.
			// okay so this is proxying web request
			const proxyServer = httpProxy.createProxyServer({
				target: 'http://localhost:8083',
				ws: true
			});

			const rewriteCookieValueIfNeeded = (clientRequest, req, socket) => {

				if (/\/socket\.io\//ig.test(req.url)) {
					const incomingQuery = url.parse(req.url, true).query;

					if (incomingQuery.bsid) {
						const decodedSid = Buffer.from(incomingQuery.bsid, 'base64').toString();
						const decodedSidCookie = `connect.sid=${decodedSid}`;

						const currentCookieHeader = clientRequest.getHeader('cookie');

						clientRequest.setHeader('cookie', currentCookieHeader ? `${currentCookieHeader}; ${decodedSidCookie}` : decodedSidCookie);
					}
				}
			};

			proxyServer.on('proxyReq', rewriteCookieValueIfNeeded);

			proxyServer.on('proxyReqWs', (clientRequest, req, socket) => {
				// check for url parm. if it exists, set it as cookie.
				console.log('ws request yay');
				rewriteCookieValueIfNeeded(clientRequest, req, socket);
			});

			proxyServer.on('error', (error) => {
				// TODO: do something w/ errors.
			});

			proxyServer.listen(config.express.port);

			socketio.connect(server);
			return server.listenAsync(8083);
		})
		.then(function () {
			log.info('server - hosted - http://' + config.express.hostName + ':' + config.express.port);
			//log.info('config file', config);
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
			log.info('mongoose ' + url);
			resolve();
		});
	});
}

function startup(){
	return Promise.join(
		User.update({}, {typingIn: null}, { multi: true }),
		ensureFirstRoom()
	)
}

function ensureFirstRoom() {
	return Room.findOne({name: 'First'})
		.then(function (firstRoom) {
			if (!firstRoom) return Room.create({name: 'First'});
		})
}

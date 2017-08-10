var ios = require('socket.io-express-session');
var routes = require('./routes');
var User = require('../models/User');
var config = require('../config/config');
var userService = require('../services/userService');
const httpProxy = require('http-proxy');
const http = require('http');

var socketio = module.exports;

socketio.connect = function (server) {

	// create server to attach socket to
	// const targetServer = http.createServer().listen(8083);
    //
	// const wsProxy = httpProxy.createProxyServer({
	// 	target: 'localhost',
	// 	port: 8083
	// });
    //
	// wsProxy.on('proxyReqWs', (clientRequest, req, socket) => {
	// 	// check for url parm. if it exists, set it as cookie.
    //
	// });
    //
	// // wsProxy.on('error', (error) => {
	// // 	console.log(error);
	// // });
    //
	// // listen to server upgrade event
	// server.on('upgrade', (req, socket, head) => {
	// 	wsProxy.ws(req, socket, head);
	// });

	// server.on('request', (req, res) => {
	// 	if (/socket\.io/ig.test(req.url)) {
	// 		wsProxy.web(req, res);
	// 		console.log('reqqqqq');
	// 	}
	// });

	var session = require('./auth').session;
	var io = require('socket.io')(server); // targetServer
	socketio.io = io;

	if(config.useRedis){
		var redis = require('socket.io-redis');
		io.adapter(redis({ host: 'localhost', port: 6379 }));
	}

	io.use(ios(session));
	io.on('connection', function (socket) {
		routes.socketio(socket);
		socket.on('disconnect', userService.disconnectSocket);
	});

	// get all the sockets connected to a room
	io.inRoom = function findClientsSocketByRoomId(roomId) {
		return _.map(_.keys(io.sockets.adapter.rooms[roomId].sockets), function (id) {
			return io.sockets.adapter.nsp.connected[id];
		});
	};

	return io;
};

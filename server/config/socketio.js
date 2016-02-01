var ios = require('socket.io-express-session');
var routes = require('./routes');
var User = require('../models/User');
var config = require('../config/config');
var userService = require('../services/userService');

var socketio = module.exports;

socketio.connect = function (server) {
	var session = require('./auth').session;
	var io = require('socket.io')(server);
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

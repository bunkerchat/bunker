var ios = require('socket.io-express-session');
var routes = require('./routes');
var User = require('../models/User');
var config = require('../config/config');

var socketio = module.exports;

socketio.connect = function (server) {
	var session = require('./auth').session;
	var io = require('socket.io')(server);
	socketio.io = io;

	if(config.useSocketioRedis){
		var redis = require('socket.io-redis');
		io.adapter(redis({ host: 'localhost', port: 6379 }));
	}

	io.set('transports', ['polling']);

	io.use(ios(session));
	io.on('connection', function (socket) {
		routes.socketio(socket);
		socket.on('disconnect', function () {
			afterDisconnect(socket);
		});
	});

	// get all the sockets connected to a room
	io.inRoom = function findClientsSocketByRoomId(roomId) {
		return _.map(_.keys(io.sockets.adapter.rooms[roomId]), function (id) {
			return io.sockets.adapter.nsp.connected[id];
		});
	};

	return io;
};


function afterDisconnect(socket) {
	return User.findOne({sockets: socket.id}).then(function (user) {
		if (!user) return;
		user.sockets = _.without(user.sockets, socket.id);
		user.connected = user.sockets.length > 0;
		user.lastConnected = new Date().toISOString();
		user.typingIn = null;
		return user.save();
	});
}

var ios = require('socket.io-express-session');
var routes = require('./routes');

module.exports.connect = function (server) {
	var session = require('./auth').session;
	var io = require('socket.io')(server);
	module.exports.io = io;

	io.use(ios(session));
	io.on('connection', function (socket) {
		routes.socketio(socket);
	});


	// get all the sockets connected to a room
	io.inRoom = function findClientsSocketByRoomId(roomId) {
		return _.map(_.keys(io.sockets.adapter.rooms[roomId]), function (id) {
			return io.sockets.adapter.nsp.connected[id];
		});
	};

	return io;
};


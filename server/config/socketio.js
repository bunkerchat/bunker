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

	return io;
};



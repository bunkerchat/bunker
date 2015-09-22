var ios = require('socket.io-express-session');
var routes = require('./routes');

module.exports.connect = function (server) {
	var session = require('./auth').session;
	var io = require('socket.io')(server);
	io.use(ios(session));
	io.on('connection', function (socket) {
		//console.log('socket', socket);
		//socket.emit('news', { hello: 'world' });
		//socket.on('my other event', function (data) {
		//	console.log(data);
		//});

		routes.socketio(socket);
	});

	return io;
};



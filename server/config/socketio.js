var ios = require('socket.io-express-session');
var routes = require('./routes');
var User = require('../models/User');

var socketio = module.exports;

socketio.connect = function (server) {
	var session = require('./auth').session;
	var io = require('socket.io')(server);
	socketio.io = io;

	io.use(ios(session));
	io.on('connection', function (socket) {
		routes.socketio(socket);
		socket.on('disconnect', function(){
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
	//var socketId = sails.sockets._id(socket);
	//if (!session.user) return;

	User.find({connected: true}).in('sockets', socket.id)
		.each(function (user) {
			user.sockets = _.without(user.sockets, socketId);
			user.connected = user.sockets.length > 0;
			user.lastConnected = new Date().toISOString();
			user.typingIn = null;
			return user.save().then(function () {

				// Wait 15 seconds before performing the update and/or sending disconnect message
				// Allows time for reconnection
				userService.pendingTasks[user._id] = setTimeout(function () {
					User.publishUpdate(user._id, user);
					//if (!user.connected) {
					//	RoomService.messageRoomsWithUser({
					//		userId: user._id,
					//		systemMessage: user.nick + ' has gone offline'});
					//}
					userService.pendingTasks[user._id] = null; // clear

				}, userService.connectionUpdateWaitSeconds * 1000);
			});
		})
}

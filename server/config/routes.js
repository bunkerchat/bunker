var config = require('./config');
var socketio = require('./socketio');

// Controllers
var viewController = require('../controllers/viewController');
var authController = require('../controllers/AuthController');
var userController = require('../controllers/UserController');
var roomController = require('../controllers/RoomController');

// Policies
var isLoggedIn = require('../policies/isLoggedIn');
//var isEditor = require('../policies/isEditor');
//var isAdmin = require('../policies/isAdmin');

module.exports.http = function (app) {

	// Public
	app.get('/login', viewController.login);
	app.get('/logout', viewController.logout);

	// Internal views
	app.get('/', isLoggedIn, viewController.index);
};

module.exports.socketio = function (socket) {
	// init
	socket.on('/init', socketToController(userController.init));

	// user
	socket.on('/user/current/connect', socketToController(userController.connect));
	socket.on('/user/current/activity', socketToController(userController.activity));
	socket.on('/user/current/markInboxRead', socketToController(userController.markInboxRead));
	socket.on('/user/current/clearInbox', socketToController(userController.clearInbox));

	// user settings
	//socket.on('/usersettings/') // TODO
	//socket.on('/usersettings/updateSettings') // TODO

	// room
	socket.on('/room', socketToController(roomController.create));
	socket.on('/room/join', socketToController(roomController.join));
	socket.on('/room/leave', socketToController(roomController.leave));
	socket.on('/room/message', socketToController(roomController.message));
	//socket.on('/room/message/edit') // TODO
	socket.on('/room/messages', socketToController(roomController.messages));

	// roommember
	//socket.on('/roommember/updateSettings') // TODO

	// message
	//socket.on('/message/emoticoncounts') // TODO

};

function socketToController(controllerFn) {
	return function (data, cb) {
		var req = {
			socket: this,
			io: socketio.io,
			session: this.handshake.session,
			body: data || {}
		};

		var res = {
			ok: function (returnData) {
				if(_.isFunction(cb)) cb(returnData);
			},
			serverError: function (err) {
				log.error('server error', err);
				if(_.isFunction(cb)) cb({error: err.message});
			},
			badRequest: function(err) {
				if(_.isFunction(cb)) cb({error: err.message});
			}
		};
		controllerFn(req, res);
	};
}

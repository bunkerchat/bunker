var config = require('./config');

// Controllers
var viewController = require('../controllers/viewController');
var authController = require('../controllers/AuthController');
var userController = require('../controllers/UserController');

// Policies
var isLoggedIn = require('../policies/isLoggedIn');
//var isEditor = require('../policies/isEditor');
//var isAdmin = require('../policies/isAdmin');

module.exports.http = function (app) {

	// Public
	app.get('/login', viewController.login);
	app.get('/logout', viewController.logout);

	// Login
	app.get('/auth/google', authController.google);
	app.get('/auth/googleReturn', authController.googleReturn);

	// Internal views
	app.get('/', isLoggedIn, viewController.index);
};

module.exports.socketio = function (socket) {

	// User
	//socket.on('/init', function (data, cb) {
	//	//console.log('this', this);
	//	cb({'datas': "things and stuff"});
	//});


	socket.on('/init', socketToController(userController.init));
	socket.on('/user/current/connect', socketToController(userController.connect));
	socket.on('/user/current/connect', socketToController(userController.connect));
};

module.exports.register = function (options) {
	var route = _.template(options.route)(options.params);
	options.socket.on(route, socketToController(options.action, options.params));
};

function socketToController(controllerFn, params) {
	return function (data, cb) {
		var req = {
			socket: this,
			session: this.handshake.session,
			params: params
		};

		var res = {
			ok: function (data) {
				cb(data);
			},
			serverError: function (err) {
				log.error('server error', err);
				cb({error: err.message});
			}
		};
		controllerFn(req, res);
	};
}

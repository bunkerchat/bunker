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
	//	console.log('this', this);
	//	cb({'datas': "things and stuff"});
	//});


	socket.on('/init', socketToController(userController.init));
};


function socketToController(controllerFn) {
	return function (data, cb) {
		var req = {
			session: this.handshake.session
		};

		var res = {
			ok: cb,
			serverError: function (err) {
				//:itisamystery:
			}
		};
		controllerFn(req, res);
	};
}
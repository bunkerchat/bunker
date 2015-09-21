// Authentication using passport, a node module
var passport = require('passport');

// no idea what this does, I assume nothing
exports.index = function (req, res) {
	res.view();
};

// logging out
exports.logout = function (req, res) {
	req.logout();
	res.redirect('/login');
};

// for local logins
exports.login = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
});

// for google logins
exports.google = passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'});

// return url for google login
exports.googleReturn = passport.authenticate('google', {successRedirect: '/', failureRedirect: '/login'});

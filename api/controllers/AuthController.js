var passport = require('passport');

exports.index = function (req, res) {
	res.view()
};
exports.logout = function (req, res) {
	req.logout();
	res.redirect('/login');
};

exports.login = passport.authenticate('local', { successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true });

exports.google = passport.authenticate('google');

exports.googleReturn = passport.authenticate('google', {successRedirect: '/', failureRedirect: '/login'});



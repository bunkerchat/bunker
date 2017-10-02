// Authentication using passport, a node module
var passport = require('passport');

// logging out
exports.logout = function (req, res) {
	req.logout();
	req.session.userId = null;
	req.session.user = null;
	res.redirect('/login');
};

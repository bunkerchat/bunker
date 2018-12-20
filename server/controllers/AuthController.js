// Authentication using passport, a node module
var passport = require("passport");

// logging out
exports.logout = function(req, res) {
	req.logout();
	res.redirect("/login");
};

module.exports.googleCallback = function(req, res) {
	req.session.googleCredentials = req.authInfo;
	// Return user profile back to client
	res.send(req.user);
};

/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

// Get the current user, pulled out of session. This will respond for GET /user/current
module.exports.current = function (req, res) {
	User.findOne(req.session.user.id).populateAll().exec(function (error, user) {
		User.subscribe(req, user.id);
		res.ok(user);
	});
};

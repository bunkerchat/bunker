/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	current: function(req, res) {
		User.findOne(req.session.user.id).populateAll().exec(function(error, user) {
			User.subscribe(req.socket, user, ['update']);
			res.json(user);
		});
	}
};


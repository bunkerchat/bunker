/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// Get the current user, pulled out of session. This will respond for GET /user/current
module.exports.current = function (req, res) {
	User.findOne(req.session.user.id).populateAll().exec(function (error, user) {
		if(error) return res.serverError(error);
		if(!user) return res.notFound();

		User.subscribe(req, user.id);
		res.ok(user);
	});
};

// Update a user
module.exports.update = function (req, res) {

	var pk = actionUtil.requirePk(req);

	if(pk !== req.session.user.id) { // Only allow updates from current user
		return res.forbidden('Not authorized to update this user');
	}

	// Only allow updates for the following values
	var updates = {
		typingIn: req.param('typingIn'),
		present: req.param('present') || undefined
	};

	User.update(pk, updates).exec(function(error, users) {
		if(error) return res.serverError(error);
		if(users.length == 0) return res.notFound();

		User.findOne(pk).populateAll().exec(function(error, user) {
			RoomService.updateAllWithUser(user.id);
			res.ok(user);
		});
	});
};

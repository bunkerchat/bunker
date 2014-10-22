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

	User.findOne(pk).populateAll().exec(function(error, user) {
		if(error) return res.serverError(error);
		if(!user) return res.notFound();

		if(user.id !== req.session.user.id) { // Only allow updates from current user
			return res.forbidden('Not authorized to update this user');
		}

		// Only allow present and typingIn to be changed
		if(req.param('present')) user.present = req.param('present');
		user.typingIn = req.param('typingIn');

		user.save()
			.then(function() {
				RoomService.updateAllWithUser(user.id);
			})
			.catch(function(error) {
				// TODO error handling
			})
			.finally(function() {
				res.ok(user);
			});
	});
};

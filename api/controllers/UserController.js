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
module.exports.update = function (req, res) {

	// Currently on allows the 'present' boolean to be updated via endpoint.
	// I see no reason to allow other values to be updated from clients at this time.
	User.update(req.param('id'), {present: req.param('present')}).exec(function (error, users) {
		if (error || users.length != 1) return;
		var user = users[0]; // only one possible

		// Inform rooms of update to their members
		RoomService.updateAllWithUser(user.id);

		// Populate the updated user and return as successful response
		User.findOne(user.id).populateAll().exec(function(error, populatedUser) {
			res.ok(populatedUser);
		});
	});
};

/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// Get the current user, pulled out of session. This will respond for GET /user/current
module.exports.current = function (req, res) {
	User.findOne(req.session.user.id).populateAll().exec(function (error, user) {
		if (error) return res.serverError(error);
		if (!user) return res.notFound();

		User.subscribe(req, user.id, ['message', 'update']);
		res.ok(user);
	});
};

module.exports.present = function(req, res) {
	var pk = actionUtil.requirePk(req);

	if (pk !== req.session.user.id) { // Only allow updates from current user
		return res.forbidden('Not authorized to update this user');
	}

	// Only allow updates for the following values
	// There's no need for us to save these in the db, so we don't bother
	// This may change in the future
	var user = req.session.user;
	var typingIn = req.param('typingIn');
	var present = req.param('present');
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true
	};

	User.publishUpdate(user.id, updates);
	res.ok(updates);
};

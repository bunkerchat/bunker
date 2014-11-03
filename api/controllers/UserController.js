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
	var sessionUser = req.session.user;
	sessionUser.lastActivity = new Date().toISOString();

	User.findOne(sessionUser.id).populateAll().exec(function (error, user) {
		if (error) return res.serverError(error);
		if (!user) return res.notFound();

		User.subscribe(req, user.id, ['message', 'update']);
		res.ok(user);
	});
};

// Activity update route. This will respond to PUT /user/current/activity
// This route only allows updates to present and typingIn.
// It can only be called by the current user.
// It's sole purpose is to enable away and typing notifications.
module.exports.activity = function(req, res) {
	var sessionUser = req.session.user;
	sessionUser.lastActivity = new Date().toISOString();

	// Only allow updates for the following values
	// There's no need for us to save these in the db, this may change in the future
	var typingIn = req.param('typingIn');
	var present = req.param('present');
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true,
		lastActivity: new Date().toISOString()
	};

	User.publishUpdate(sessionUser.id, updates);
	res.ok(updates);
};

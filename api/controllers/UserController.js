/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports.current = function (req, res) {
	User.findOne(req.session.user.id).populateAll().exec(function (error, user) {
		User.subscribe(req, user);
		actionUtil.subscribeDeep(req, user);
		res.ok(user);
	});
};

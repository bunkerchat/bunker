var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports = function (req, res, next) {
	var pk = actionUtil.requirePk(req);

	User.findOne(req.session.user.id).exec(function (err, user) {
		if (pk !== user.settings) { // Only allow updates from current user
			return res.forbidden('Not authorized to update this user setting');
		}
		next();
	});

};

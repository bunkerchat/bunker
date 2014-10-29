var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports = function (req, res, next) {
	var pk = actionUtil.requirePk(req);
	if (pk !== req.session.user.settings) { // Only allow updates from current user
		return res.forbidden('Not authorized to update this user setting');
	}
	next();
};

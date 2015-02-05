var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports = function (req, res, next) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	if (pk == userId) {
		return next();
	}
	return res.forbidden();
};

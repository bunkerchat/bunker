var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

module.exports = function (req, res, next) {
	var pk = actionUtil.requirePk(req);
	var sessionUser = req.session.user;

	if(pk == sessionUser.id) {
		return next();
	}
	return res.forbidden();
};

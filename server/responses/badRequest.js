var config = require("./../config/config");

module.exports = function(req, res, next) {
	res.badRequest = function(err) {
		res.status(400).send(err);
	};
	next();
};

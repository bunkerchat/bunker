var serverError = require('./../config/serverErrorHandler');

var config = require('./../config/config');

module.exports = function (req, res, next) {
	res.serverError = function (err) {
		return serverError(err, req, res);
	};
	next();
};

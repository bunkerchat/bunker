module.exports = function(req, res, next) {
	res.forbidden = function(err) {
		res.status(403).send(err);
	};
	next();
};

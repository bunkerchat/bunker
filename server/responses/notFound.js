module.exports = function (req, res, next) {
	res.notFound = function (data) {
		res.status(404);
		if (/application\/json/.test(req.get('accept'))) {
			// Tests if req explicitly requested JSON
			res.json(data);
		}
		else {
			res.send(data);
		}
	};
	next();
};
module.exports = function (req, res, next) {
	res.ok = function (data) {
		res.status(200);
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
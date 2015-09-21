var config = require('./../config/config');

module.exports = function serverError(err, req, res) {

	// if environment is defined (aka production), strip error information
	if (config.isProduction) {
		err = {message: "Sorry, a server error has occurred"};
	}

	res.status(500);

	if (/application\/json/.test(req.get("accept"))) {
		// Tests if req explicitly requested JSON
		res.json(err);
	}
	else {
		res.send(err.message);
	}
};


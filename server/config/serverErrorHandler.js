var config = require("./../config/config");

module.exports = function serverError(err, req, res) {
	log.warn("server error", err);

	// if environment is defined (aka production), strip error information
	if (!config.showServerErrors) {
		err = { serverErrorMessage: "Sorry, a server error has occurred" };
	}

	err.serverErrorMessage = "Sorry, a server error has occurred";

	if (/application\/json/.test(req.get("accept"))) {
		// Tests if req explicitly requested JSON
		res.json(err);
	} else {
		res.send(err.message);
	}
};

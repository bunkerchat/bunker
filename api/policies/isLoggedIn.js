module.exports = function (request, response, next) {
	if (request.session.user) {
		next();
	}
	else if (request.user) {
		request.session.user = request.user; // user won't be available in socket calls without this
		next();
	}
	else {
		response.redirect('/login');
	}
};

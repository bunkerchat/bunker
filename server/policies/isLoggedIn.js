module.exports = function (request, response, next) {
	if (request.session.userId) {
		next();
	}
	else if (request.user) {
		// Passport places a 'user' object on the request, but sockets do not have access to it.
		// Place the user's id into the session, which sockets do have access to.
		// WARNING: This should always be the userId, not the user. Requests should pull user from db if they need more info
		request.session.userId = request.user._id;
		next();
	}
	else {
		response.redirect('/login');
	}
};

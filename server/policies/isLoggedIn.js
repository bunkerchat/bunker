module.exports = (req, res, next) => {
	if (req.session.userId) {
		next();
	} else if (req.user) {
		// Passport places a 'user' object on the request, but sockets do not have access to it.
		// Place the user's id into the session, which sockets do have access to.
		// WARNING: This should always be the userId, not the user. Requests should pull user from db if they need more info
		req.session.userId = req.user._id;
		next();
	} else {
		res.redirect("/login");
	}
};

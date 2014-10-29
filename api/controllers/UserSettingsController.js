module.exports.current = function (req, res) {

	var sessionUser = req.session.user;

	UserSettings.findOne({user: sessionUser.id}).exec(function (err, userSettings) {
		if (err) return res.serverError(err);
		if (!userSettings) return res.notFound();

		res.ok(userSettings);
	});
};

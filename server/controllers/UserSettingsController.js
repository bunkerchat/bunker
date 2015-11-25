var UserSettings = require('../models/UserSettings');

module.exports.save = function (req, res) {
	var id = req.body.userSettingsId.toObjectId();
	var update = req.body.settings;

	UserSettings.findByIdAndUpdate(id, update)
		.then(res.ok)
		.catch(res.serverError);
};

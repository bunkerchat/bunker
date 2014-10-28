/* global require, module, User */

var uuid = require('node-uuid');

module.exports.sendUserSpecificMessage = function (user, systemMessage) {
	User.publishUpdate(user.id, user);

	if (systemMessage) {
		User.message(user.id, {
			id: uuid.v4(),
			text: systemMessage,
			createdAt: new Date().toISOString()
		});
	}
};

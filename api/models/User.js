/* global module */

module.exports = {
	attributes: {
		token: {
			type: 'string',
			required: true,
			minLength: 20
		},
		nick: {
			type: 'string',
			required: true,
			minLength: 1,
			maxLength: 20
		},
		email: 'email',
		sockets: {
			type: 'array',
			defaultsTo: []
		},
		connected: {
			type: 'boolean',
			defaultsTo: false
		},
		present: {
			type: 'boolean',
			defaultsTo: true
		},
		typingIn: {
			type: 'string',
			defaultsTo: null
		},
		settings: {
			model: 'UserSettings'
		}
	},
	afterCreate: function (user, cb) {
		// Create a UserSettings object for the user.
		UserSettings.create({user: user.id}).exec(function (error, userSettings) {
			User.update(user.id, {settings: userSettings}).exec(cb);
		});
	}
};


/* global module */

module.exports = {

	attributes: {
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
		lastConnected: {
			type: 'date'
		},
		present: {
			type: 'boolean',
			defaultsTo: true
		},
		busy: {
			type: 'boolean',
			defaultsTo: false
		},
		busyMessage: {
			type: 'string'
		},
		typingIn: {
			type: 'string',
			defaultsTo: null
		},
		settings: {
			model: 'UserSettings'
		},

		// Remove secret things
		toJSON: function () {
			var obj = this.toObject();
			delete obj.token;
			delete obj.sockets;
			return obj;
		}
	},

	// Add the settings object
	afterCreate: function (user, cb) {
		// Create a UserSettings object for the user.
		UserSettings.create({user: user._id}).exec(function (error, userSettings) {
			User.update(user._id, {settings: userSettings}).exec(cb);
		});
	}
};


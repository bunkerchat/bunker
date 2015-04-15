module.exports = {
	attributes: {
		user: {
			model: 'User'
		},
		message: {
			model: 'Message'
		},
		read: {
			type: 'boolean',
			defaultsTo: false
		}
	}
};

module.exports = {
	autoUpdatedAt: false,
	attributes: {
		room: {
			model: 'Room'
		},
		author: {
			model: 'User'
		},
		text: {
			type: 'string',
			required: true,
			minLength: 1
		},
		edited: {
			type: 'boolean',
			required: false,
			defaultsTo: false
		}
	}
};

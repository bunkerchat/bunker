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
		}
	}
};

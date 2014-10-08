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
		rooms: {
			collection: 'Room',
			via: 'members'
		},
		connected: {
			type: 'boolean',
			defaultsTo: false
		}
	}
};


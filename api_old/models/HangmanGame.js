module.exports = {
	attributes: {
		room: {
			model: 'Room'
		},
		user: {
			model: 'User'
		},
		word: {
			type: 'string',
			required: true
		},
		misses: {
			type: 'array',
			defaultsTo: []
		},
		hits: {
			type: 'array',
			defaultsTo: []
		},
		isPrivate: {
			type: 'boolean'
		},
		lastGuessSuccess: 'boolean'
	}
};

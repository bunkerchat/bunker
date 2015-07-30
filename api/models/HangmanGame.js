module.exports = {
	attributes: {
		room: {
			model: 'Room'
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
		lastGuessSuccess: 'boolean'
	}
};

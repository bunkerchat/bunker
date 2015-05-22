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
			type: 'string'
		},
		hits: {
			type: 'string'
		},
		lastGuessSuccess: 'boolean'
	}
};

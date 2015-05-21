module.exports = {
	attributes: {
		room: {
			model: 'Room'
		},
		word: {
			type: 'string',
			required: true,
			minLength: 7,
			maxLength: 7
		},
		misses: {
			type: 'string'
		},
		hits: {
			type: 'string'
		}
	}
};

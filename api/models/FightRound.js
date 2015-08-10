module.exports = {
	attributes: {
		fight: {
			model: 'Fight'
		},
		roundNumber: {
			type: 'integer',
			required: true
		},
		challengerPlay: {
			type: 'string',
			enum: ['h', 'm', 'l']
		},
		opponentPlay: {
			type: 'string',
			enum: ['h', 'm', 'l', ''],
			defaultsTo: ''
		}
	}
};

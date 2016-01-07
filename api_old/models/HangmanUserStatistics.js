module.exports = {
	attributes: {
		user: {
			model: 'User'
		},
		privateGameWinCount: {
			type: 'integer',
			defaultsTo: 0
		},
		privateGameLossCount: {
			type: 'integer',
			defaultsTo: 0
		},
		guessMisses: {
			type: 'integer',
			defaultsTo: 0
		},
		guessHits: {
			type: 'integer',
			defaultsTo: 0
		}
	}
};

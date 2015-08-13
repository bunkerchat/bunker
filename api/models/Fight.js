module.exports = {
	attributes: {
		room: {
			model: 'Room'
		},
		challenger: {
			model: 'User'
		},
		opponent: {
			model: 'User'
		},
		resultMessage: {
			type: 'string',
			defaultsTo: ''
		},
		winningUser : {
			model: 'User'
		}
	}
};

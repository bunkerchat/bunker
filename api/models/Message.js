module.exports = {
	autoUpdatedAt: false,
	attributes: {
		room: {
			model: 'Room'
		},
		author: {
			model: 'User'
		},
		type: {
			type: 'string',
			enum: [
				'standard',
				'emote',
				'room',
				'global',
				'help',
				'roll',
				'8ball',
				'animation',
				'buildNotification',
				'hangman',
				'code',
				'stats'
			],
			defaultsTo: 'standard'
		},
		text: {
			type: 'string',
			required: true,
			minLength: 1
		},
		edited: {
			type: 'boolean',
			defaultsTo: false
		},
		editCount:{
			type: 'integer',
			defaultsTo: 0
		}
	}
};

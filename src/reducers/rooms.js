const handlers = {
	'init/receive': (state, action) => {
		return _(action.data.rooms)
			.map(room => {
				room.$messages = _.reverse(room.$messages);
				return room;
			})
			.keyBy('_id')
			.value()
	},
	'message/receive': (state, action) => {
		// Existing bunker server code sends new messages with a full author object
		// For consistency just make all message authors the same (_id only)
		action.message.author = action.message.author._id;

		const currentMessages = state[action.message.room].$messages;
		const updated = {...state};
		updated[action.message.room].$messages = [...currentMessages, action.message];
		return updated;
	}
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

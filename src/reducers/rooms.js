const handlers = {
	'init/receive': (state, action) => {
		return _(action.data.rooms)
			.map(room => {
				room.$messages = _.reverse(room.$messages);
				return room;
			})
			.keyBy('_id')
			.value()
	}
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

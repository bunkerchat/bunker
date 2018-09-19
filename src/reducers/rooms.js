const handlers = {
	'init/receive': (state, action) => _.keyBy(action.data.rooms, '_id')
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

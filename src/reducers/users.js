const handlers = {
	'init/receive': (state, action) => _.keyBy(action.data.users, '_id')
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

const handlers = {
	"init/received": (state, action) => _.keyBy(action.data.users, "_id"),
	"user/updated": (state, action) => ({
		...state,
		[action.user._id]: {
			...state[action.user._id],
			...action.user
		}
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

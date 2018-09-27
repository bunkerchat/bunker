const handlers = {
	"init/receive": (state, action) => _.keyBy(action.data.users, "_id"),
	"user/updated": (state, action) => {
		const users = { ...state };
		users[action.user._id] = { ...state[action.user._id], ...action.user };
		return users;
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

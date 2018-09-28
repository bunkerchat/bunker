const handlers = {
	"init/received": (state, action) => {
		const user = { ...action.data.user, loaded: true };

		return {
			...state,
			...user
		};
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

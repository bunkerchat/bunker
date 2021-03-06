const handlers = {
	"init/received": (state, action) => ({
		...state,
		...action.payload.user,
		loaded: true
	}),
	"localUser/present": (state, action) => ({
		...state,
		present: action.present
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

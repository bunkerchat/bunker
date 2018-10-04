const handlers = {
	"init/received": (state, action) => ({
		...state,
		...action.data.user,
		loaded: true
	}),
	"localUser/activeRoom": (state, action) => ({
		...state,
		activeRoom: action.roomId
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

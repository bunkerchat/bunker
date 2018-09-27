const handlers = {
	"init/received": state => ({
		...state,
		loaded: true
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

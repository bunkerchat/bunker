const handlers = {
	"init/received": (state, action) => action.data.userSettings
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

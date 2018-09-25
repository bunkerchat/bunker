const handlers = {
	"init/receive": (state, action) => action.data.userSettings,
	"userSettings/theme": (state, action) => {
		return {
			...state,
			theme: action.theme
		};
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

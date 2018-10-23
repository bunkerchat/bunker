const handlers = {
	"emoticonPicker/show": (state, action) => ({
		...state,
		target: action.target
	}),
	"emoticonPicker/hide": state => ({
		...state,
		target: null
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

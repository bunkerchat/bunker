const handlers = {
	"messageControls/show": (state, action) => ({
		...state,
		messageId: action.messageId
	}),
	"messageControls/hide": state => ({
		...state,
		messageId: null
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

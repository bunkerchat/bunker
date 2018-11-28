const handlers = {
	"messageControls/show": (state, action) => ({
		...state,
		messageId: action.messageId,
		x: action.x,
		y: action.y
	}),
	"messageControls/hide": state => ({
		...state,
		messageId: null
	})
};

export default function (state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

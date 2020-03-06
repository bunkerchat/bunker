const handlers = {
	"images/received": (state, action) => ({
		message: action.message,
		images: action.images
	}),
	"images/close": () => null
};

export default function(state = null, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

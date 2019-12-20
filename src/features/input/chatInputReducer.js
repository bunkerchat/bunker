export const appendNick = (roomId, nick) => {
	const text = nick ? `@${nick}` : nick;
	return { type: "chatInput/appendNick", roomId, text };
};
export const appendText = (roomId, textToAppend) => ({ type: "chatInput/appendText", roomId, text: textToAppend });
export const updateText = (roomId, text) => ({ type: "chatInput/text", roomId, text });
export const updateEditedMessage = ({ roomId, editedMessage }) => ({ type: "chatInput/edited", roomId, editedMessage });

function getAppendedState(state, action) {
	const appendText = `${action.text} `;

	return {
		...state,
		byRoom: {
			...state.byRoom,
			[action.roomId]: {
				...state.byRoom[action.roomId],
				appendText
			}
		}
	};
}

const handlers = {
	"chatInput/text": (state, action) => ({
		...state,
		byRoom: {
			...state.byRoom,
			[action.roomId]: {
				...state.byRoom[action.roomId],
				text: action.text
			}
		}
	}),
	"chatInput/appendText": (state, action) => getAppendedState(state, action),
	"chatInput/appendNick": (state, action) => getAppendedState(state, action),
	"chatInput/edited": (state, action) => ({
		...state,
		byRoom: {
			...state.byRoom,
			[action.roomId]: {
				...state.byRoom[action.roomId],
				editedMessage: action.editedMessage
			}
		}
	})
};

export default function(state = { byRoom: {} }, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

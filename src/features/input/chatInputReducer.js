export const appendNick = (roomId, nick) => ({ type: "chatInput/appendNick", roomId, nick });
export const updateText = (roomId, text) => ({ type: "chatInput/text", roomId, text });
export const updateEditedMessage = (roomId, editedMessage) => ({ type: "chatInput/edited", roomId, editedMessage });

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
	"chatInput/appendNick": (state, action) => {
		const currentText = state.byRoom[action.roomId] ? state.byRoom[action.roomId].text : "";
		const text = currentText.length > 0 ? `${currentText} @${action.nick} ` : `@${action.nick} `;
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[action.roomId]: {
					...state.byRoom[action.roomId],
					text
				}
			}
		}
	},
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

export default function (state = { byRoom: {} }, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

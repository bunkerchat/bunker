import { maxMessages } from "../../constants/chat";

const parseMessage = message => {
	// Existing bunker server code sends new & loaded messages with a full author object
	// For consistency just make all message authors the same (_id only)
	message.author = _.isObject(message.author) && message.author._id ? message.author._id : message.author;
	return message;
};

const handlers = {
	"init/received": (state, { payload }) => ({
		byRoom: {
			...state.byRoom,
			..._.reduce(
				payload.rooms,
				(byRoom, room) => {
					byRoom[room._id] = _(room.$messages)
						.reverse()
						.map(parseMessage)
						.value();
					// todo preserve existing messages
					return byRoom;
				},
				{}
			)
		},
		byKey: payload.rooms.reduce(
			(byKey, room) => {
				room.$messages.forEach(message => {
					if (!byKey) return; // no idea why this is happening
					byKey[message._id] = parseMessage(message);
				});
				return byKey;
			},
			{ ...state.byKey }
		)
	}),
	"message/received": (state, action) => {
		const message = parseMessage(action.message);
		return {
			...state,
			lastMessage: message,
			byRoom: {
				...state.byRoom,
				[message.room]: _.uniqBy([...state.byRoom[message.room], message], "_id")
			},
			byKey: {
				...state.byKey,
				[message._id]: message
			}
		};
	},
	"message/receivedHistory": (state, action) => {
		const messages = _(action.messages)
			.reverse()
			.map(parseMessage)
			.value();
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[action.roomId]: _.uniqBy([...messages, ...state.byRoom[action.roomId]], "_id")
			},
			byKey: messages.reduce((byKey, message) => {
				byKey[message._id] = message;
				return byKey;
			}, state.byKey || {})
		};
	},
	"message/clear": (state, action) => ({
		...state,
		byRoom: {
			...state.byRoom,
			[action.roomId]: _.takeRight(state.byRoom[action.roomId], maxMessages)
		}
	}),
	"message/updated": (state, action) => {
		const message = parseMessage(action.message);
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[message.room]: _.map(
					state.byRoom[message.room],
					existing => (existing._id === message._id ? { ...existing, ...message } : existing)
				)
			},
			byKey: {
				...state.byKey,
				[message._id]: message
			}
		};
	},
	"message/toggleImagesVisible": (state, action) => {
		const message = action.message;
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[message.room]: _.map(
					state.byRoom[message.room],
					existing => (existing._id === message._id ? { ...message, imagesVisible: !existing.imagesVisible } : existing)
				)
			},
			byKey: {
				...state.byKey,
				[message._id]: { ...[message._id], imagesVisible: ![message._id].imagesVisible }
			}
		};
	}
};

const defaultState = {
	byKey: {}
};

export default function(state = defaultState, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

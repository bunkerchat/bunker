import { maxMessages } from "../constants/chat";

const parseMessage = message => {
	// Existing bunker server code sends new & loaded messages with a full author object
	// For consistency just make all message authors the same (_id only)
	message.author = _.isObject(message.author) && message.author._id ? message.author._id : message.author;
	return message;
};

const handlers = {
	"init/received": (state, action) => ({
		byRoom: {
			...state.byRoom,
			..._.reduce(
				action.data.rooms,
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
		}
	}),
	"message/received": (state, action) => {
		const message = parseMessage(action.message);
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[message.room]: [...state.byRoom[message.room], message]
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
				[action.roomId]: [...messages, ...state.byRoom[action.roomId]]
			}
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
					existing => (existing._id === message._id ? message : existing)
				)
			}
		};
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

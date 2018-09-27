import { maxMessages } from "../constants/chat";

const parseMessage = message => {
	// Existing bunker server code sends new & loaded messages with a full author object
	// For consistency just make all message authors the same (_id only)
	message.author = _.isObject(message.author) && message.author._id ? message.author._id : message.author;
	return message;
};

const setCurrentRoom = rooms => {
	_.each(rooms, room => {
		room.current = false;
	});

	const roomMatch = /room\/(\w+)/i.exec(window.location.pathname);
	if (roomMatch) {
		const room = rooms[roomMatch[1]];
		if (room) {
			room.current = true;
			room.unreadMessageCount = 0;
		}
	}

	return rooms;
};

const handlers = {
	"init/received": (state, action) => {
		const updated = {
			...state,
			..._(action.data.rooms)
				.map(room => {
					room.$messages = _.reverse(room.$messages);
					room.unreadMessageCount = 0;
					return room;
				})
				.keyBy("_id")
				.value()
		};
		return setCurrentRoom(updated);
	},
	"@@router/LOCATION_CHANGE": state => {
		return setCurrentRoom({ ...state });
	},
	"message/loadingMany": (state, action) => ({
		...state,
		[action.roomId]: {
			...state[action.roomId],
			loading: true
		}
	}),
	"message/received": (state, action) => {
		action.message = parseMessage(action.message);

		const updated = { ...state };
		const room = updated[action.message.room];
		room.$messages = [...room.$messages, action.message];

		if (!room.current) {
			if (!_.isNumber(room.unreadMessageCount)) {
				room.unreadMessageCount = 0;
			}
			room.unreadMessageCount++;
		}

		return updated;
	},
	"message/receivedHistory": (state, action) => {
		action.messages = _.map(action.messages, parseMessage);

		const updated = { ...state };
		const room = updated[action.roomId];
		room.loading = false;

		if (action.messages.length === 0) {
			room.fullHistoryLoaded = true;
		} else {
			room.$messages = _.uniqBy([..._.reverse(action.messages), ...room.$messages], "_id");
		}

		return updated;
	},
	"message/clear": (state, action) => {
		const updated = { ...state };
		const room = updated[action.roomId];
		room.fullHistoryLoaded = false;
		room.$messages = _.takeRight(room.$messages, maxMessages);
		return updated;
	},
	"message/updated": (state, action) => {
		const message = parseMessage(action.message);
		const room = state[message.room];
		return {
			...state,
			[room._id]: {
				...room,
				$messages: _.map(
					room.$messages,
					existing => (existing._id === message._id ? { ...existing, ...message } : existing)
				)
			}
		};
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

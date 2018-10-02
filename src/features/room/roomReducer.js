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
	"init/received": (state, action) =>
		setCurrentRoom({
			...state,
			..._.keyBy(action.data.rooms, "_id")
		}),
	"@@router/LOCATION_CHANGE": state => setCurrentRoom({ ...state }),
	"message/loadingMany": (state, action) => ({
		...state,
		[action.roomId]: {
			...state[action.roomId],
			loading: true
		}
	}),
	"message/received": (state, action) => {
		const room = state[action.message.room];
		return {
			...state,
			[room._id]: {
				...state[room._id],
				unreadMessageCount: !room.current ? (!_.isNumber(room.unreadMessageCount) ? 1 : room.unreadMessageCount + 1) : 0
			}
		};
	},
	"message/receivedHistory": (state, action) => ({
		...state,
		[action.roomId]: {
			...state[action.roomId],
			loading: false,
			fullHistoryLoaded: action.messages.length === 0
		}
	}),
	"message/clear": (state, action) => ({
		...state,
		[action.roomId]: {
			...state[action.roomId],
			fullHistoryLoaded: false
		}
	})
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}

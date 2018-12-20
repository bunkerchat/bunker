const setCurrentRoom = rooms => {
	_.each(rooms, room => {
		room.current = false;
	});

	const roomMatch = /room\/(\w+)/i.exec(window.location.pathname);
	if (roomMatch) {
		const room = rooms[roomMatch[1]];
		if (room) {
			room.current = true;
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
	"room/updated": (state, action) => ({
		...state,
		[action.room._id]: {
			...state[action.room._id],
			...action.room
		}
	}),
	"@@router/LOCATION_CHANGE": state => setCurrentRoom({ ...state }),
	"message/loadingMany": (state, action) => ({
		...state,
		[action.roomId]: {
			...state[action.roomId],
			loading: true
		}
	}),
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

import { emit } from "../../api";
import { clearRoomMessages, messageHistoryReceived } from "../message/messageSlice";
import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

export function loadRoomMessages(roomId, skip) {
	return dispatch => {
		dispatch(loadingMessages({ roomId }));
		return emit("/room/messages", { roomId, skip: skip || 0 }).then(messages =>
			dispatch(messageHistoryReceived({ roomId, messages }))
		);
	};
}

export const joinRoom = roomId => dispatch => {
	return emit("/room/join", roomId).then(room => dispatch(joinedRoom({ room })));
};

const roomsSlice = createSlice({
	name: "rooms",
	initialState: {},
	extraReducers: {
		[initialDataReceived]: (state, { payload }) => {
			payload.rooms.forEach(room => {
				state[room._id] = room;
			});
		},
		[messageHistoryReceived]: (state, { payload }) => {
			state[payload.roomId].loading = false;
			state[payload.roomId].fullHistoryLoaded = payload.messages.length === 0;
		},
		[clearRoomMessages]: (state, { payload }) => {
			if (state[payload.roomId]) {
				state[payload.roomId].fullHistoryLoaded = false;
			}
		}
	},
	reducers: {
		roomUpdated: (state, { payload }) => {
			_.assignIn(state[payload.room._id], payload.room);
		},
		loadingMessages: (state, { payload }) => {
			state[payload.roomId].loading = true;
		},
		joinedRoom: (state, { payload }) => {
			state[payload.room._id] = payload.room;
		}
	}
});

export const { roomUpdated, loadingMessages, joinedRoom } = roomsSlice.actions;

export default roomsSlice.reducer;

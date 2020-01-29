import { createSlice } from "@reduxjs/toolkit";
import { getActiveRoomId } from "../room/roomSelectors";

export const appendText = appendText => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(appendTextByRoom({ roomId, appendText }));
};

export const appendNick = nick => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(appendNickByRoom({ roomId, nick }));
};

export const updateEditedMessage = editedMessage => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(updateEditedMessageByRoom({ roomId, editedMessage }));
};

export const setNewText = newText => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(setNewTextByRoom({ roomId, newText }));
};

const ensureRoom = (state, roomId) => {
	if (!state.byRoom[roomId]) {
		state.byRoom[roomId] = {};
	}
};

const chatInputSlice = createSlice({
	name: "chatInput",
	initialState: { byRoom: {} },
	extraReducers: {},
	reducers: {
		appendTextByRoom(state, { payload }) {
			const { roomId, appendText } = payload;
			ensureRoom(state, roomId);
			state.byRoom[roomId].appendText = appendText;
		},
		appendNickByRoom(state, { payload }) {
			const { roomId, nick } = payload;
			ensureRoom(state, roomId);
			state.byRoom[roomId].appendText = nick ? `@${nick}` : nick;
		},
		updateEditedMessageByRoom(state, { payload }) {
			const { roomId, editedMessage } = payload;
			ensureRoom(state, roomId);
			state.byRoom[roomId].editedMessage = editedMessage;
		},
		setNewTextByRoom(state, { payload }) {
			const { roomId, newText } = payload;
			ensureRoom(state, roomId);
			state.byRoom[roomId].newText = newText;
		}
	}
});

export const { appendTextByRoom, appendNickByRoom, updateEditedMessageByRoom, setNewTextByRoom } = chatInputSlice.actions;

export default chatInputSlice.reducer;

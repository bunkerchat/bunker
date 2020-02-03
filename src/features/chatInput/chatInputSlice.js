import { createSlice } from "@reduxjs/toolkit";

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

export const { appendTextByRoom, updateEditedMessageByRoom, setNewTextByRoom } = chatInputSlice.actions;

export default chatInputSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { updateEditedMessage } from "../chatInput/chatInputThunks";

export const messageControlEditMessage = messageId => (dispatch, getState) => {
	dispatch(showMessageControls(messageId));
	dispatch(updateEditedMessage(messageId));
};

const messageSlice = createSlice({
	name: "messageControls",
	initialState: {},
	reducers: {
		showMessageControls(state, { payload }) {
			state.messageId = payload.messageId;
		},
		hideMessageControls(state) {
			state.messageId = null;
		}
	}
});

export const { showMessageControls, hideMessageControls } = messageSlice.actions;

export default messageSlice.reducer;

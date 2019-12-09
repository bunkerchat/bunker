import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
	name: "messageControls",
	initialState: {},
	reducers: {
		showMessageControls(state, action) {
			state.messageId = action.payload.messageId;
		},
		hideMessageControls(state) {
			state.messageId = null;
		}
	}
});

export const { showMessageControls, hideMessageControls } = messageSlice.actions;

export default messageSlice.reducer;

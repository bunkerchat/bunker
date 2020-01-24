import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

const roomSlice = createSlice({
	name: "room",
	initialState: { activeRoomId: null },
	extraReducers: {
		"@@router/LOCATION_CHANGE": (state, { payload }) => {
			// empty array is lobby
			const roomMatch = /room\/(\w+)/i.exec(payload.location.pathname) || [];
			state.activeRoomId = roomMatch[1];
		}
	},
	reducers: {}
});

export const {} = roomSlice.actions;

export default roomSlice.reducer;

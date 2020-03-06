import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
	name: "room",
	initialState: { activeRoomId: null },
	reducers: {
		setActiveRoom: (state, { payload }) => {
			state.activeRoomId = payload;
		}
	}
});

export const {setActiveRoom} = roomSlice.actions;

export default roomSlice.reducer;

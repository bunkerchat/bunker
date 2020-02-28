import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
	name: "room",
	initialState: { activeRoomId: null },
	// extraReducers: {
	// 	"@@router/LOCATION_CHANGE": (state, { payload }) => {
	// 		// empty array is lobby
	// 		const roomMatch = /room\/(\w+)/i.exec(payload.location.pathname) || [];
	// 		state.activeRoomId = roomMatch[1];
	// 	}
	// },
	reducers: {
		setActiveRoom: (state, { payload }) => {
			state.activeRoomId = payload;
		}
	}
});

export const {setActiveRoom} = roomSlice.actions;

export default roomSlice.reducer;

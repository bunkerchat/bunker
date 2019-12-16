import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

const localRoomMembersSlice = createSlice({
	name: "localRoomMembers",
	initialState: { byRoom: {} },
	extraReducers: {
		[initialDataReceived]: (state, action) => ({ byRoom: _.keyBy(action.payload.memberships, "room") })
	},
	reducers: {
		localRoomMemberUpdated(state, action) {
			const existing = _.find(state.byRoom, { _id: action.payload._id });
			if (existing) {
				_.assign(existing, action.payload);
			}
		}
	}
});

export const { localRoomMemberUpdated } = localRoomMembersSlice.actions;

export default localRoomMembersSlice.reducer;

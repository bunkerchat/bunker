import { createSlice } from "@reduxjs/toolkit";

const localRoomMembersSlice = createSlice({
	name: "localRoomMembers",
	initialState: { byRoom: {} },
	reducers: {
		"init/received": (state, action) => ({ byRoom: _.keyBy(action.data.memberships, "room") }),

		localRoomMemberUpdated(state, action) {
			const { roomMember } = action.payload;
			if (!roomMember) return;
			const existing = _.find(state.byRoom, { _id: roomMember._id });
			state.byRoom[existing.room].roomMember = roomMember;
		}
	}
});

export const { localRoomMemberUpdated } = localRoomMembersSlice.actions;

export default localRoomMembersSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

const localRoomMembersSlice = createSlice({
	name: "localRoomMembers",
	initialState: { byRoom: {} },
	reducers: {
		[initialDataReceived]: (state, action) => ({ byRoom: _.keyBy(action.payload.memberships, "room") }),

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

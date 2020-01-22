import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

const usersSlice = createSlice({
	name: "users",
	initialState: {},
	extraReducers: {
		[initialDataReceived]: (state, { payload }) => _.keyBy(payload.users, "_id")
	},
	reducers: {
		userUpdated(state, { payload }) {
			_.extend(state[payload._id], payload);
		}
	}
});

export const { userUpdated } = usersSlice.actions;

export default usersSlice.reducer;

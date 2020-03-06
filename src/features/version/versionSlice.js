import { createSlice } from "@reduxjs/toolkit";
import { initialDataReceived } from "../init/initActions";

const versionSlice = createSlice({
	name: "version",
	initialState: {},
	extraReducers: {
		[initialDataReceived]: (state, { payload }) => {
			// on re-connects, set version to a new field which is different from app start
			if (state.clientVersionV2) {
				state.clientVersionV2New = payload.version.clientVersionV2;
			} else {
				state.clientVersionV2 = payload.version.clientVersionV2;
			}
		}
	},
	reducers: {}
});

export const {} = versionSlice.actions;

export default versionSlice.reducer;

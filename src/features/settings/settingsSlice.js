import {createSlice} from "@reduxjs/toolkit";
import {initialDataReceived} from "../init/initActions";

const settingsSlice = createSlice({
	name: "userSettings",
	initialState: {},
	reducers: {
		updateSettings(state, {payload}) {
			_.assign(state, payload)
		}
	},
	extraReducers: {
		[initialDataReceived]: (state, {payload})=> {
			return payload.userSettings;
		}
	}
});


export const { updateSettings } = settingsSlice.actions;

export default settingsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const nickPickerSlice = createSlice({
	name: "nickPicker",
	initialState: {
		visible: false,
		search: "",
		users: [],
		filteredUsers: [],
		selected: null
	},
	reducers: {
		showNickPicker(state, { payload }) {
			state.visible = true;
			state.search = "";
			state.users = payload.users;
			state.filteredUsers = payload.users;
			state.selected = _.first(payload.users);
		},
		hideNickPicker(state) {
			state.visible = false;
		},
		searchNickPicker(state, { payload }) {
			const search = payload.text.toLowerCase();
			const filteredUsers = search ? state.users.filter(user => user.nick.toLowerCase().includes(search)) : state.users;
			state.search = search;
			state.filteredUsers = filteredUsers;
			state.selected = _.first(filteredUsers);
		},
		selectLeftInNickPicker(state) {
			const { filteredUsers, selected } = state;
			let previousIndex = _.findIndex(filteredUsers, selected) - 1;
			if (previousIndex < 0) {
				previousIndex = filteredUsers.length - 1;
			}
			state.selected = filteredUsers[previousIndex];
		},
		selectRightInNickPicker(state) {
			const { filteredUsers, selected } = state;
			let nextIndex = _.findIndex(filteredUsers, selected) + 1;
			if (nextIndex === filteredUsers.length) {
				nextIndex = 0;
			}
			state.selected = filteredUsers[nextIndex];
		}
	}
});

export const { showNickPicker, hideNickPicker, searchNickPicker, selectLeftInNickPicker, selectRightInNickPicker } = nickPickerSlice.actions;

export default nickPickerSlice.reducer;

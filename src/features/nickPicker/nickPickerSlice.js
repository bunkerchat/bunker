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
		}
	}
});

export const { showNickPicker, hideNickPicker, searchNickPicker } = nickPickerSlice.actions;

export default nickPickerSlice.reducer;


//
// const handlers = {
// 	"nickPicker/selectLeft": state => {
// 		const { filteredEmoticons, selected } = state;
// 		let previousIndex = filteredEmoticons.indexOf(selected) - 1;
// 		if (previousIndex < 0) {
// 			previousIndex = filteredEmoticons.length - 1;
// 		}
//
// 		return { ...state, selected: filteredEmoticons[previousIndex] };
// 	},
// 	"nickPicker/selectRight": state => {
// 		const { filteredEmoticons, selected } = state;
//
// 		let nextIndex = filteredEmoticons.indexOf(selected) + 1;
// 		if (nextIndex === filteredEmoticons.length) {
// 			nextIndex = 0;
// 		}
//
// 		return { ...state, selected: filteredEmoticons[nextIndex] };
// 	},
// 	"nickPicker/selectUp": state => {
// 		const { filteredEmoticons, selected } = state;
//
// 		let previousIndex = filteredEmoticons.indexOf(selected) - 5;
// 		if (previousIndex < 0) {
// 			previousIndex = 0;
// 		}
// 		return { ...state, selected: filteredEmoticons[previousIndex] };
// 	},
// 	"nickPicker/selectDown": state => {
// 		const { filteredEmoticons, selected } = state;
//
// 		let nextIndex = filteredEmoticons.indexOf(selected) + 5;
//
// 		if (nextIndex > filteredEmoticons.length) {
// 			nextIndex = filteredEmoticons.length;
// 		}
// 		return { ...state, selected: filteredEmoticons[nextIndex] };
// 	}
// };
//


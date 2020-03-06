import { setReplaceText } from "../chatInput/chatInputThunks";
import { hideNickPicker, showNickPicker } from "./nickPickerSlice";
import { getSearchValueNick } from "./nickPickerSelectors";
import { getSortedRoomMemberUsers } from "../roomMember/roomMemberSelectors";

export const startOpenNickPicker = () => (dispatch, getState) => {
	const state = getState();
	const users = getSortedRoomMemberUsers(state);
	dispatch(showNickPicker({users}));
};

export const nickPicked = user => (dispatch, getState) => {
	const state = getState();
	const searchValue = getSearchValueNick(state);
	dispatch(setReplaceText(`@${searchValue}`, `@${user.nick} `));
	dispatch(hideNickPicker());
};

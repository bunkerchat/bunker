import { appendTextByRoom, replaceTextByRoom, setNewTextByRoom, updateEditedMessageByRoom } from "./chatInputSlice";
import { getActiveRoomId } from "../room/roomSelectors";
import { getMessageById } from "../message/messageSelectors";

export const setAppendText = appendText => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(appendTextByRoom({ roomId, appendText }));
};

export const setReplaceText = (oldReplaceText, newReplaceText) => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(replaceTextByRoom({ roomId, oldReplaceText, newReplaceText }));
};

export const updateEditedMessage = editedMessageId => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	const editedMessage = getMessageById(editedMessageId)(getState());
	dispatch(updateEditedMessageByRoom({ roomId, editedMessage }));
};

export const setNewText = newText => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(setNewTextByRoom({ roomId, newText }));
};

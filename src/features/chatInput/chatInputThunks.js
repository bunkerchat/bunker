import { appendTextByRoom, setNewTextByRoom, updateEditedMessageByRoom } from "./chatInputSlice";
import { getActiveRoomId } from "../room/roomSelectors";
import { getMessageById } from "../message/messageSelectors";

export const appendText = appendText => (dispatch, getState) => {
	const roomId = getActiveRoomId(getState());
	dispatch(appendTextByRoom({ roomId, appendText }));
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

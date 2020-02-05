import { emit } from "../../api";
import { messageUpdated } from "./messageSlice";

export const toggleReaction = (messageId, emoticonName) => {
	return (dispatch, getState) => {
		return emit("/message/reaction", { messageId, emoticonName });
	};
};
export const updateMessage = message => {
	return dispatch => {
		return emit("/message/edit", { message }).then(updated => {
			dispatch(messageUpdated({ message: updated }));
		});
	};
};
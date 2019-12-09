import { emit } from "../../api";
import { messageUpdated } from "../room/roomsSlice";

const messageReacted = () => {
	return { type: "message/reacted" };
};

export const toggleMessageImagesVisible = message => {
	return { type: "message/toggleImagesVisible", message };
};

export const toggleReaction = (messageId, emoticonName) => {
	return dispatch => {
		return emit("/message/reaction", { messageId, emoticonName }).then(() => {
			dispatch(messageReacted());
		});
	};
};

export const updateMessage = message => {
	return dispatch => {
		return emit("/message/edit", { message }).then(updated => {
			dispatch(messageUpdated(updated));
		});
	};
};

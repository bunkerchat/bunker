import { emit } from "../../api";

const messageReacted = () => {
	return { type: "message/reacted" };
};

export const toggleReaction = (messageId, emoticonName) => {
	return dispatch => {
		return emit("/message/reaction", { messageId, emoticonName }).then(() => {
			dispatch(messageReacted());
		});
	};
};

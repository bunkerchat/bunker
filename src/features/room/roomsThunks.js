import { emit } from "../../api";
import { getActiveRoomId } from "./roomSelectors.js";

const throttledSend = _.throttle(
	activeRoomId => {
		emit("/user/current/typing", { typingIn: activeRoomId });
	},
	1250,
	{ trailing: false }
);

export const sendTypingNotification = () => (dispatch, getState) => {
	const state = getState();
	const activeRoomId = getActiveRoomId(state);
	throttledSend(activeRoomId);
};

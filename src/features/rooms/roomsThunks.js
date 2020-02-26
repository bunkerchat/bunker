import { emit } from "../../api";
import { getActiveRoomId } from "../room/roomSelectors.js";

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

export function sendRoomMessage(roomId, text) {
	return dispatch => {
		return emit("/room/message", { roomId, text });
	};
}

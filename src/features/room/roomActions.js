import { emit } from "../../api";

export function loadingMessages(roomId) {
	return { type: "message/loadingMany", roomId };
}

export function messageSent() {
	return { type: "message/sent" };
}

export function messageReceived(message) {
	return { type: "message/received", message };
}

export function messageHistoryReceived(roomId, messages) {
	return { type: "message/receivedHistory", roomId, messages };
}

export function messageUpdated(message) {
	return { type: "message/updated", message };
}

export function clearRoomMessages(roomId) {
	return { type: "message/clear", roomId };
}

export function sendRoomMessage(roomId, text) {
	return dispatch => {
		return emit("/room/message", { roomId, text }).then(() => {
			dispatch(messageSent());
		});
	};
}

export function loadRoomMessages(roomId, skip) {
	return dispatch => {
		dispatch(loadingMessages(roomId));
		return emit("/room/messages", { roomId, skip: skip || 0 }).then(messages =>
			dispatch(messageHistoryReceived(roomId, messages))
		);
	};
}

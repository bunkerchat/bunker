import { emit } from "../api";

export function sentMessage() {
	return { type: "message/sent" };
}

export function receiveMessage(message) {
	return { type: "message/receive", message };
}

export function receiveMessages(roomId, messages) {
	return { type: "message/receiveMany", roomId, messages };
}

export function loadingMessages(roomId) {
	return { type: "message/loadingMany", roomId };
}

export function clearRoomMessages(roomId) {
	return { type: "message/clear", roomId };
}

export function sendRoomMessage(roomId, text) {
	return dispatch => {
		return emit("/room/message", { roomId, text }).then(() => {
			dispatch(sentMessage());
		});
	};
}

export function loadRoomMessages(roomId, skip) {
	return dispatch => {
		dispatch(loadingMessages(roomId));
		return emit("/room/messages", { roomId, skip: skip || 0 }).then(messages =>
			dispatch(receiveMessages(roomId, messages))
		);
	};
}

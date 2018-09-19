import {emit} from "../api";

export function sentMessage() {
	return {type: "room/sent"};
}

export function sendRoomMessage(roomId, text) {
	return dipsatch => {
		return emit('/room/message', {roomId, text})
			.then(() => {
				dipsatch(sentMessage());
			});
	}
}


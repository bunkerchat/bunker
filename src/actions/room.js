import {emit} from '../api';

export function sentMessage() {
	return {type: 'message/sent'};
}

export function receiveMessage(message) {
	return {type: 'message/receive', message}
}

export function sendRoomMessage(roomId, text) {
	return dipsatch => {
		return emit('/room/message', {roomId, text})
			.then(() => {
				dipsatch(sentMessage());
			});
	}
}


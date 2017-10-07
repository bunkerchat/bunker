import {sendSocketIoMessage} from '../session/socketio'
import {messagesFetched} from './roomReducer';

export const sendMessage = (roomId, message) => (dispatch) => {
	return sendSocketIoMessage('/room/message', { roomId, text: message })
		.then(populatedMessage => {
			// Don't actually need to use the responded message, as messages are echoed back to us.

			// TODO: in error scenarios the message wouldn't be echoed back to us (and thus wouldn't display).
			// Would need to dispatch the errored message to allow user to try and send it again maybe.
			//dispatch({type:'socketio-room-messaged', data: populatedMessage})
		});
};

export const loadMessages = (roomId, skip) => (dispatch) => {
	return sendSocketIoMessage('/room/messages', { roomId, skip })
		.then(messages => {
			dispatch(messagesFetched(roomId, messages));
		});
};

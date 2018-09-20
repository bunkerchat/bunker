import io from 'socket.io-client';
import {dispatch} from './store';
import {connected, disconnected, emitEndpoint, errorResponse, reconnected, successResponse} from './actions/socket';
import {receiveMessage} from './actions/room';

const socket = io(window.url);

socket.on('connect', () => {
	dispatch(connected());
});
socket.on('reconnect', () => {
	dispatch(reconnected());
});
socket.on('disconnect', () => {
	dispatch(disconnected());
});
socket.on('room', socketMessage => {
	switch(socketMessage.verb) {
		case 'messaged':
			dispatch(receiveMessage(socketMessage.data));
			break;
	}
});

// async emit function
// only accepts data as a JSON object
// returns a promise
export function emit(endpoint, data) {
	dispatch(emitEndpoint(endpoint));

	const payload = _.isObject(data) ? data : undefined;
	return new Promise((resolve, reject) => {
		socket.emit(endpoint, payload, (response) => {
			if (response && response.error) {

				dispatch(errorResponse(response));
				// dispatch(apiError(response));

				return reject(new Error(response.error));
			}

			dispatch(successResponse(response));
			resolve(response);
		});
	})
		.catch(err => {
			console.error('socket emit error', err);
		});
}

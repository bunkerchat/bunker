import io from "socket.io-client";
import { dispatch } from "./store";
import {
	connected,
	disconnected,
	emitEndpoint,
	errorResponse,
	reconnected,
	successResponse
} from "./features/socket/socketActions";
import { messageUpdated, messageReceived } from "./features/room/roomActions";
import { chatActions } from "./features/chat/chatActions";
import { userUpdated } from "./features/users/userActions";
import { ping } from "./features/users/localUserActions";

const socket = io(window.url);

socket.on("connect", () => {
	dispatch(connected());
	dispatch(chatActions());
});
socket.on("reconnect", () => {
	dispatch(reconnected());
});
socket.on("disconnect", () => {
	dispatch(disconnected());
});
socket.on("room", socketMessage => {
	switch (socketMessage.verb) {
		case "messaged":
			const message = socketMessage.data;
			if (message.edited) {
				dispatch(messageUpdated(message));
			} else {
				dispatch(messageReceived(message));
			}
			break;
	}
});
socket.on("user", socketMessage => {
	switch (socketMessage.verb) {
		case "updated":
			// Add in user's _id because for some reason it's not sent down by server
			dispatch(userUpdated({ ...socketMessage.data, _id: socketMessage._id }));
			break;
	}
});

// Ping server every 15 seconds so they know we're alive
// This keeps the client 'active' in the member list
// todo still have to do this? <--- I'm sure this todo will live here forever
setInterval(() => {
	dispatch(ping());
}, 15 * 1000);

// async emit function
// only accepts data as a JSON object
// returns a promise
export function emit(endpoint, data) {
	dispatch(emitEndpoint(endpoint));

	const payload = _.isObject(data) ? data : undefined;
	return new Promise((resolve, reject) => {
		socket.emit(endpoint, payload, response => {
			if (response && response.error) {
				dispatch(errorResponse(response));
				// dispatch(apiError(response));

				return reject(new Error(response.error));
			}

			dispatch(successResponse(response));
			resolve(response);
		});
	}).catch(err => {
		console.error("socket emit error", err);
	});
}

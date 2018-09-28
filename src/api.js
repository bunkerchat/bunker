import io from "socket.io-client";
import { dispatch } from "./store";
import { connected, disconnected, emitEndpoint, errorResponse, reconnected, successResponse } from "./actions/socket";
import { messageUpdated, messageReceived } from "./actions/rooms";
import { init } from "./actions/init";
import { userUpdated } from "./actions/users";

const socket = io(window.url);

socket.on("connect", () => {
	dispatch(connected());
	dispatch(init());
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

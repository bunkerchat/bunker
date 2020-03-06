import io from "socket.io-client";
import { dispatch } from "./store";
import { init } from "./features/init/initThunks";
import { ping } from "./features/users/localUserActions";
import { localRoomMemberUpdated } from "./features/users/localRoomMembersSlice";
import { imagePickSelectionsReceived } from "./features/imagePick/imagePickActions";
import { roomUpdated } from "./features/rooms/roomsSlice";
import { connected, disconnected, errorResponse, reconnected, successResponse } from "./features/socket/socketSlice";
import { userUpdated } from "./features/users/usersSlice";
import { messageReceived, messageUpdated } from "./features/message/messageSlice";

const socket = io(window.url);
// const socket = io('http://localhost:9002');

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
				dispatch(messageUpdated({ message }));
			} else {
				dispatch(messageReceived({ message }));
			}
			break;
		case "reacted":
			dispatch(messageUpdated({ message: socketMessage.data }));
			break;
		case "updated":
			dispatch(roomUpdated({ room: { ...socketMessage.data, _id: socketMessage._id } }));
			break;
	}
});
socket.on("user", socketMessage => {
	switch (socketMessage.verb) {
		case "updated":
			// Add in user's _id because for some reason it's not sent down by server
			dispatch(userUpdated({ ...socketMessage.data, _id: socketMessage._id }));
			break;
		case "messaged": {
			if (socketMessage.data.type === "pick") {
				dispatch(imagePickSelectionsReceived(socketMessage.data.message, socketMessage.data.data));
			}
		}
	}
});
socket.on("user_roommember", socketMessage => {
	switch (socketMessage.verb) {
		case "updated":
			// Add in room member's _id because for some reason it's not sent down by server
			dispatch(localRoomMemberUpdated({ ...socketMessage.data, _id: socketMessage._id }));
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

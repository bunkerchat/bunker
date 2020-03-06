import { createSlice } from "@reduxjs/toolkit";

export function emitEndpoint(endpoint) {
	return { type: `socket/${endpoint}` };
}

export function successResponse(response) {
	return { type: `socket/200`, response };
}

export function errorResponse(response) {
	return { type: `socket/${response.code}`, response };
}

// export function connected() {
// 	return { type: "socket/connected" };
// }

// export function reconnected() {
// 	return { type: "socket/reconnected" };
// }

// export function disconnected() {
// 	return { type: "socket/disconnected" };
// }

const socketSlice = createSlice({
	name: "socket",
	initialState: { connected: false },
	reducers: {
		connected(state) {
			state.connected = true;
		},
		reconnected(state) {
			state.connected = true;
		},
		disconnected(state) {
			state.connected = false;
		}
	}
});

export const { connected, reconnected, disconnected } = socketSlice.actions;

export default socketSlice.reducer;

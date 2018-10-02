export function emitEndpoint(endpoint) {
	return { type: `socket/${endpoint}` };
}

export function successResponse(response) {
	return { type: `socket/200`, response };
}

export function errorResponse(response) {
	return { type: `socket/${response.code}`, response };
}

export function connected() {
	return { type: "socket/connected" };
}

export function reconnected() {
	return { type: "socket/reconnected" };
}

export function disconnected() {
	return { type: "socket/disconnected" };
}

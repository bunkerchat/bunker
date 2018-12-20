import { emit } from "../../api";

export function activeRoomChanged(roomId) {
	return { type: "localUser/activeRoom", roomId };
}

export function presentChanged(present) {
	return { type: "localUser/present", present };
}

export const ping = () => () => emit("/user/current/ping");

export function changeActiveRoom(roomId) {
	return dispatch => {
		return emit("/user/current/activity", { room: roomId }).then(() => dispatch(activeRoomChanged(roomId)));
	};
}

export function changePresent(present) {
	return dispatch => {
		return emit("/user/current/present", { present }).then(() => dispatch(presentChanged(present)));
	};
}

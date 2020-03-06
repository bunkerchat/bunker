import { emit } from "../../api";
import { setActiveRoom } from "../room/roomSlice.js";

export function presentChanged(present) {
	return { type: "localUser/present", present };
}

export const ping = () => () => emit("/user/current/ping");

export const changeActiveRoom = roomId => dispatch => {
	dispatch(setActiveRoom(roomId));
	return emit("/user/current/activity", { room: roomId });
};

export function changePresent(present) {
	return dispatch => {
		return emit("/user/current/present", { present }).then(() => dispatch(presentChanged(present)));
	};
}

import { emit } from "../../api";

export function activeRoomChanged(roomId) {
	return { type: "localUser/activeRoom", roomId };
}

export const ping = () => () => emit("/user/current/ping");

export function changeActiveRoom(roomId) {
	return dispatch => {
		return emit("/user/current/activity", { room: roomId }).then(() => dispatch(activeRoomChanged(roomId)));
	};
}

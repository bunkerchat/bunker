import {emit} from "../api";

export function receiveRooms(rooms) {
	return {type: 'rooms/receive', rooms}
}

export function getRooms() {
	return dispatch => {
		return emit('get_rooms')
			.then(rooms => {
				dispatch(receiveRooms(rooms))
			});
	}
}

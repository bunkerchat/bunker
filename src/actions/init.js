import { emit } from "../api";

export function receiveInit(data) {
	return { type: "init/receive", data };
}

export function init() {
	return dispatch => {
		return emit("/init").then(data => {
			dispatch(receiveInit(data));
		});
	};
}

import { emit } from "../../api";

export function initialDataReceived(data) {
	return { type: "init/received", data };
}

export function chatActions() {
	return dispatch => {
		return emit("/init").then(data => {
			dispatch(initialDataReceived(data));
		});
	};
}

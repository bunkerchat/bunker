import { emit } from "../../api";

export function initialDataReceived(data) {
	return { type: "init/received", data };
}

export function init() {
	return dispatch => {
		return emit("/init", { present: window.document.visibilityState === "visible" }).then(data => {
			dispatch(initialDataReceived(data));
		});
	};
}

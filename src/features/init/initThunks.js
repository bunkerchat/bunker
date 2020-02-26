import { emit } from "../../api";
import { initialDataReceived } from "./initActions";

export function init() {
	return dispatch => {
		return emit("/init", { present: window.document.visibilityState === "visible" }).then(data => {
			dispatch(initialDataReceived(data));
		});
	};
}

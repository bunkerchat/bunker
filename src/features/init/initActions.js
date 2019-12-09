import { createAction } from "@reduxjs/toolkit";
import { emit } from "../../api";

export const initialDataReceived = createAction("init/received");

export function init() {
	return dispatch => {
		return emit("/init", { present: window.document.visibilityState === "visible" }).then(data => {
			dispatch(initialDataReceived(data));
		});
	};
}

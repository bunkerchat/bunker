import {emit} from "../../api";
import {updateSettings} from "./settingsSlice";

export function setPlayMusic(playMusic) {
	return (dispatch) => dispatch(saveUserSettings({playMusic}))
}

export function setTheme(theme) {
	return (dispatch) => dispatch(saveUserSettings({theme}))
		.then(() => {
			window.location.reload();
		});
}

function saveUserSettings(update) {
	return (dispatch, getState) => {
		// FYI: Weird code here, just following existing server logic
		const userSettingsId = getState().userSettings._id;
		return emit("/usersettings/save", {
			userSettingsId,
			settings: update
		})
			.then(() => {
				dispatch(updateSettings(update))
			});
	};
}

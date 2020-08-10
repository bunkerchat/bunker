import {emit} from "../../api";
import {updateSettings} from "./settingsSlice";

export function setPlayMusic(playMusic) {
	return (dispatch, getState) => {
		const userSettings = getState().userSettings;
		return saveUserSettings(userSettings, {playMusic});
	};
}

export function setTheme(theme) {
	return (dispatch, getState) => {
		const userSettings = getState().userSettings;
		return saveUserSettings(userSettings, {theme})
			.then(() => {
				window.location.reload();
			});
	};
}


function saveUserSettings(userSettings, update) {
	// FYI: Weird code here, just following existing server logic
	const userSettingsId = userSettings._id;
	return emit("/usersettings/save", {
		userSettingsId,
		settings: update
	})
		.then(() => {
			dispatch(updateSettings(update))
		});
}

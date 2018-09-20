import {emit} from "../api";

export function setTheme(theme) {
	return (dispatch, getState) => {

		// FYI: Weird code here, just following existing server logic

		const userSettingsId = getState().userSettings._id;
		return emit('/usersettings/save', {userSettingsId, settings: {theme}})
			.then(() => {
				window.location.reload();
			});
	};
}

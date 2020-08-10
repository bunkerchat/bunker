export const playMusic = message => (dispatch, getState) => {
	const state = getState();
	if (message.type === "music") {
		const userSettings = state.userSettings;
		if (userSettings.playMusic) {
			const uri = _.last(message.tokens).value;
			window.location = `spotify:track:${uri}:play`;
		}
	}
};

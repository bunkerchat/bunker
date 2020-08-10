export const playMusic = message => (dispatch, getState) => {
	const state = getState();
	if (message.type === "music") {
		const userSettings = state.userSettings;
		const room = state.rooms[message.room];
		if (userSettings.playMusic && room.name === "Music") {
			const uri = _.last(message.tokens).value;
			window.location = `spotify:track:${uri}:play`;
		}
	}
};

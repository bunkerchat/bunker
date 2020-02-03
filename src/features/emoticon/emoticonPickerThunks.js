import { hideEmoticonPicker } from "./emoticonPickerActions";
import { appendText } from "../chatInput/chatInputThunks";
import { toggleReaction } from "../message/messageActions";
import { getMessageControlsMessageId } from "../messageControls/messageControlsSelectors";
import { getSearchInputVisible } from "./emoticonPickerSelectors";
import { hideMessageControls } from "../messageControls/messageControlsSlice";

export const emoticonPicked = emoticonName => (dispatch, getState) => {
	const state = getState();

	// todo: switch this to be something like "message emoticon open" or something
	if (getSearchInputVisible(state)) {
		const messageId = getMessageControlsMessageId(state);
		dispatch(toggleReaction(messageId, emoticonName));
	} else {
		// opened from chat input
		dispatch(appendText(`:${emoticonName}:`));
	}

	dispatch(hideEmoticonPicker());
	dispatch(hideMessageControls());
};

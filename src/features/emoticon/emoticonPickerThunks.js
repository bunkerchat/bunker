import { hideEmoticonPicker } from "./emoticonPickerActions";
import { appendText } from "../chatInput/chatInputThunks";
import { toggleReaction } from "../message/messageActions";
import { getMessageControlsMessageId } from "../messageControls/messageControlsSelectors";
import { getSearchInputVisible } from "./emoticonPickerSelectors";

export const emoticonPicked = emoticonName => (dispatch, getState) => {
	const state = getState();
	dispatch(hideEmoticonPicker());

	// todo: switch this to be something like "message emoticon open" or something
	if (getSearchInputVisible(state)) {
		const messageId = getMessageControlsMessageId(getState());
		dispatch(toggleReaction(messageId, emoticonName));
		return;
	}

	// opened from chat input
	dispatch(appendText(`:${emoticonName}:`));
};


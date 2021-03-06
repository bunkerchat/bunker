import { hideEmoticonPicker } from "./emoticonPickerActions";
import { setReplaceText } from "../chatInput/chatInputThunks";
import { getMessageControlsMessageId } from "../messageControls/messageControlsSelectors";
import { getSearchInputVisible, getSearchValueEmoticon } from "./emoticonPickerSelectors";
import { hideMessageControls } from "../messageControls/messageControlsSlice";
import { toggleReaction } from "../message/messageThunks";

export const emoticonPicked = emoticonName => (dispatch, getState) => {
	const state = getState();

	// todo: switch this to be something like "message emoticon open" or something
	if (getSearchInputVisible(state)) {
		const messageId = getMessageControlsMessageId(state);
		dispatch(toggleReaction(messageId, emoticonName));
	} else {
		// opened from chat input
		const searchValue = getSearchValueEmoticon(state);
		dispatch(setReplaceText(`:${searchValue}`, `:${emoticonName}: `));
	}

	dispatch(hideEmoticonPicker());
	dispatch(hideMessageControls());
};

export const getSelectedEmoticon = state => state.emoticonPicker.selected;

// todo: switch this to be something like "message emoticon open" or something
export const getSearchInputVisible = state => state.emoticonPicker.searchInputVisible;

export const getSearchValueEmoticon = state => state.emoticonPicker.search;

export const getIsSelectedEmoticon = emoticonName => state => getSelectedEmoticon(state) === emoticonName;

export const getIsInSearchFilter = emoticonName => state => {
	const searchValue = getSearchValueEmoticon(state);
	if (!searchValue || !searchValue.length) return true;
	return emoticonName.includes(searchValue);
};


export const showEmoticonPicker = (x, y, direction, searchInputVisible) => {
	return { type: "emoticonPicker/show", x, y, direction, searchInputVisible };
};

export const hideEmoticonPicker = () => {
	return { type: "emoticonPicker/hide" };
};

export const searchEmoticonPicker = text => {
	return { type: "emoticonPicker/search", text };
};

export const selectLeftEmoticonPicker = () => {
	return { type: "emoticonPicker/selectLeft" };
};

export const selectRightEmoticonPicker = () => {
	return { type: "emoticonPicker/selectRight" };
};

export const selectUpEmoticonPicker = () => {
	return { type: "emoticonPicker/selectUp" };
};

export const selectDownEmoticonPicker = () => {
	return { type: "emoticonPicker/selectDown" };
};

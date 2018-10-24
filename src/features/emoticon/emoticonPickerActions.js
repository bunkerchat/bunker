export const showEmoticonPicker = (target, onPick) => {
	return { type: "emoticonPicker/show", target, onPick };
};

export const hideEmoticonPicker = () => {
	return { type: "emoticonPicker/hide" };
};

export const searchEmoticonPicker = text => {
	return { type: "emoticonPicker/search", text };
};

export const selectLeftInEmoticonPicker = () => {
	return { type: "emoticonPicker/selectLeft" };
};

export const selectRightInEmoticonPicker = () => {
	return { type: "emoticonPicker/selectRight" };
};

export const selectUpInEmoticonPicker = () => {
	return { type: "emoticonPicker/selectUp" };
};

export const selectDownInEmoticonPicker = () => {
	return { type: "emoticonPicker/selectDown" };
};

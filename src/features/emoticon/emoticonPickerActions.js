export const showEmoticonPicker = target => {
	return { type: "emoticonPicker/show", target };
};

export const hideEmoticonPicker = () => {
	return { type: "emoticonPicker/hide" };
};

export const searchEmoticonPicker = text => {
	return { type: "emoticonPicker/search", text }
};

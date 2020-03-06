import _ from "lodash";

const emoticonName = input => input.replace(/\.\w+$/, "");

const list = _.map(window.emoticonNames, emoticon => ({
	name: emoticonName(emoticon),
	file: emoticon,
	isIcon: /^fa-/.test(emoticon)
}));

export const all = list;
export const imageEmoticons = _.filter(list, { isIcon: false });
export const imageEmoticonsNames = _.filter(list, { isIcon: false }).map(emoticon => emoticon.name);
export const imageEmoticonsFiles = _.filter(list, { isIcon: false }).map(emoticon => emoticon.file);
export const emoticonNameHash = _.keyBy(list, "name");
export const names = _.map(list, "name");
export const files = _.map(list, "file");

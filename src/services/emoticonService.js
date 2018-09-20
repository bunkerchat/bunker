import _ from "lodash";

const emoticonName = (input) => input.replace(/\.\w+$/, '');

const list = _.map(window.emoticons, emoticon => ({
	name: emoticonName(emoticon),
	file: emoticon,
	isIcon: /^fa-/.test(emoticon)
}));

const emoticonService = {
	all: list,
	imageEmoticons: _.filter(list, {isIcon: false}),
	names: _.map(list, 'name'),
	files: _.map(list, 'file')
};

export default emoticonService;

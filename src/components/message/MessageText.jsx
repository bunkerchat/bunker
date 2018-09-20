import React from "react";
import emoticonService from '../../services/emoticonService';

// Note I felt it was okay to use dangerouslySetInnerHTML since we escape everything on the server
// todo could be improved?
export default class MessageText extends React.Component {
	render() {
		let {text} = this.props;
		text = parseEmoticons(text);

		return <div dangerouslySetInnerHTML={{__html: text}}/>;
	}
}

const replaceAll = (str, find, replace) => str.split(find).join(replace);

// todo we want to start doing this nonsense on the server? any advantages?
const parseEmoticons = (text) => {
	const replacedEmotes = {};
	const emoticons = emoticonService.all;

	// Parse emoticons
	_.each(text.match(/:[\w-]+:/g), emoticonText => {
		const knownEmoticon = _.find(emoticons, known => {
			return known.file.replace(/\.\w{1,4}$/, '').toLowerCase() === emoticonText.replace(/:/g, '').toLowerCase();
		});

		if (knownEmoticon && !replacedEmotes[knownEmoticon.file]) {
			// if an image emoticon (more common)
			if (!knownEmoticon.isIcon) {
				text = replaceAll(text, emoticonText,
					`<img class="emoticon" title="${emoticonText}" src="/assets/images/emoticons/${knownEmoticon.file}"/>`);
			}
			else { // font-awesome icon emoticon
				text = replaceAll(text, emoticonText,
					`<i class="fa ${knownEmoticon.file} fa-lg" title=":${knownEmoticon.name}:"></i>`);
			}
			replacedEmotes[knownEmoticon.file] = true;
		}
	});
	return text;
};

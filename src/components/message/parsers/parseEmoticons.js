import emoticons from "../../../constants/emoticons";
import { replaceAll } from "./util";

const allEmoticons = emoticons.all;

const parseEmoticons = text => {
	const replacedEmotes = {};

	_.each(text.match(/:[\w-]+:/g), emoticonText => {
		const knownEmoticon = _.find(allEmoticons, known => {
			return known.file.replace(/\.\w{1,4}$/, "").toLowerCase() === emoticonText.replace(/:/g, "").toLowerCase();
		});

		if (knownEmoticon && !replacedEmotes[knownEmoticon.file]) {
			// if an image emoticon (more common)
			if (!knownEmoticon.isIcon) {
				text = replaceAll(
					text,
					emoticonText,
					`<img class="emoticon" title="${emoticonText}" src="/assets/images/emoticons/${knownEmoticon.file}"/>`
				);
			} else {
				// font-awesome icon emoticon
				text = replaceAll(
					text,
					emoticonText,
					`<i class="fa ${knownEmoticon.file} fa-lg" title=":${knownEmoticon.name}:"></i>`
				);
			}
			replacedEmotes[knownEmoticon.file] = true;
		}
	});
	return text;
};

export default parseEmoticons;

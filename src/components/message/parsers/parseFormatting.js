import {replaceAll} from "./util";

const types = [
	{marker: '*', tag: 'strong'},
	{marker: '_', tag: 'em'},
	{marker: '~', tag: 'del'},
	{marker: '|', tag: 'mark'},
	{marker: '`', tag: 'code'}
];

const parseFormatting = text => {

	_.each(types, type => {
		const lookup = new RegExp('(\\' + type.marker + '[^\\' + type.marker + ']+\\' + type.marker + ')', 'g');

		let match;
		while ((match = lookup.exec(text)) !== null) {
			const charBefore = match.index - 1;
			if (text[charBefore] && text[charBefore] === '\\') {
				var startIndex = match.index - 1 > 0 ? match.index - 1 : 0;
				var newText = '';
				if (startIndex > 0) {
					newText += text.slice(0, startIndex);
				}
				newText += match[0].substr(0, match[0].lastIndexOf('\\')) + match[0].substr(match[0].lastIndexOf('\\') + 1);
				newText += text.slice(match.index + match[0].length);
				text = newText;
				continue;
			}
			text = replaceAll(text, match[0].trim(), '<' + type.tag + '>' + replaceAll(match[0], type.marker, '') + '</' + type.tag + '>');
		}
	});

	return text;
};

export default parseFormatting;

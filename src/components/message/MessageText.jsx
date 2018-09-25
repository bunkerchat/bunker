import React from "react";
import parseEmoticons from "./parsers/parseEmoticons";
import parseMedia from "./parsers/parseMedia";
import parseFormatting from "./parsers/parseFormatting";

// Note I felt it was okay to use dangerouslySetInnerHTML since we escape everything on the server
// todo could be improved?
export default class MessageText extends React.Component {
	render() {
		let { text } = this.props;
		text = parseText(text);

		return <div dangerouslySetInnerHTML={{ __html: text }} />;
	}
}

function parseText(text) {
	const tokensSplitOnUrls = text.split(/(https?:\/\/\S+)/i); // split on urls
	const parsedTokens = _.map(tokensSplitOnUrls, token => {
		// Parse urls as media only
		if (token.match(/https?:\/\/\S+/i)) {
			token = parseMedia(token);
		} else {
			token = parseFormatting(token);
			// if (bunkerData.userSettings.showEmoticons) {
			token = parseEmoticons(token);
			// }
		}
		return token;
	});

	return parsedTokens.join(" ");
}

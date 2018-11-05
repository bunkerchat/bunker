import React from "react";
import parseEmoticons from "./parsers/parseEmoticons";
import parseMedia from "./parsers/parseMedia";
import parseFormatting from "./parsers/parseFormatting";
import styled from "styled-components";
import theme from "../../constants/theme";

const MessageTextContainer = styled.div`
	display: inline-block;
	word-break: break-word;

	.emoticon {
		max-height: 24px;
	}

	mark {
		padding: 0;
		background: black;

		&:hover {
			background: transparent;
			${theme.spoilerHoverForegroundColor ? `color: ${theme.spoilerHoverForegroundColor}` : ""};
		}
	}
`;

// Note I felt it was okay to use dangerouslySetInnerHTML since we escape everything on the server
// todo could be improved?
export default class MessageText extends React.PureComponent {
	render() {
		let { text } = this.props;
		text = parseText(text);

		return <MessageTextContainer dangerouslySetInnerHTML={{ __html: text }} />;
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

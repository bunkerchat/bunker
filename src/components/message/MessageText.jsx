import React from "react";
import connect from "react-redux/es/connect/connect";
import parseEmoticons from "./parsers/parseEmoticons";
import parseMedia from "./parsers/parseMedia";
import parseFormatting from "./parsers/parseFormatting";
import styled from "styled-components";
import theme from "../../constants/theme";

const MessageTextContainer = styled.div`
	.emoticon {
		max-height: 24px;
	}
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		${theme.mentionForegroundColor ? "color:" + theme.mentionForegroundColor : ""};
	}
`;

const mapStateToProps = state => ({
	nick: state.user.nick
});

// Note I felt it was okay to use dangerouslySetInnerHTML since we escape everything on the server
// todo could be improved?
class MessageText extends React.PureComponent {
	render() {
		const { nick } = this.props;

		let { text } = this.props;
		text = parseText(text);

		return (
			<MessageTextContainer
				className={text.includes(nick) ? "mention" : ""}
				dangerouslySetInnerHTML={{ __html: text }}
			/>
		);
	}
}

export default connect(mapStateToProps)(MessageText);

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

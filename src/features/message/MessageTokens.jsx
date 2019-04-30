import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import Emoticon from "./tokens/Emoticon.jsx";
import Url from "./tokens/Url.jsx";
import Word from "./tokens/Word.jsx";
import Quote from "./tokens/Quote.jsx";
import Image from "./tokens/Image.jsx";

const MessageTextContainer = styled.div`
	display: inline-block;
	word-break: break-word;

	mark {
		padding: 0;
		background: black;

		&:hover {
			background: transparent;
			${theme.spoilerHoverForegroundColor ? `color: ${theme.spoilerHoverForegroundColor}` : ""};
		}
	}
`;

const Code = ({ value }) => <code dangerouslySetInnerHTML={{ __html: value }}/>;
const Italics = ({ value }) => <em dangerouslySetInnerHTML={{ __html: value }}/>;
const Bold = ({ value }) => <strong dangerouslySetInnerHTML={{ __html: value }}/>;
const Spoiler = ({ value }) => <mark dangerouslySetInnerHTML={{ __html: value }}/>;
const Strikethrough = ({ value }) => <del dangerouslySetInnerHTML={{ __html: value }}/>;

const tokenMap = {
	quote: Quote,
	code: Code,
	url: Url,
	image: Image,
	italics: Italics,
	bold: Bold,
	spoiler: Spoiler,
	strikethrough: Strikethrough,
	word: Word,
	unknown: Word,
	emoticon: Emoticon,
	emoji: Word
};

const mapToMessage = (message, token, index) => {
	const TokenType = tokenMap[token.type];
	return <TokenType message={message} value={token.value} key={index + token.type + token.value}/>;
};

export default class MessageTokens extends React.Component {
	render() {
		const { message } = this.props;
		const tokens = message.tokens || [{ type: "unknown", value: message.text }];
		return (
			<MessageTextContainer>{tokens.map((token, index) => mapToMessage(message, token, index))}</MessageTextContainer>
		);
	}
}

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

const Code = ({ token }) => <code dangerouslySetInnerHTML={{ __html: token.value }} />;
const Italics = ({ token }) => <em dangerouslySetInnerHTML={{ __html: token.value }} />;
const Bold = ({ token }) => <strong dangerouslySetInnerHTML={{ __html: token.value }} />;
const Spoiler = ({ token }) => <mark dangerouslySetInnerHTML={{ __html: token.value }} />;
const Strikethrough = ({ token }) => <del dangerouslySetInnerHTML={{ __html: token.value }} />;

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
	return <TokenType message={message} token={token} key={index + token.type + token.value} />;
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

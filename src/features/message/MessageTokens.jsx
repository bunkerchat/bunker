import React from "react";
import { createStructuredSelector } from "reselect";
import styled from "styled-components";
import theme from "../../constants/theme";

const mapStateToProps = createStructuredSelector({});

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

const Quote = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Code = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Url = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Italics = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Bold = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Spoiler = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Strikethrough = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;
const Word = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;

const tokenMap = {
	quote: Quote,
	code: Code,
	url: Url,
	italics: Italics,
	bold: Bold,
	spoiler: Spoiler,
	strikethrough: Strikethrough,
	word: Word,
	unknown: Word
};

const mapToMessage = (token, index) => {
	const Derp = tokenMap[token.type];
	return <Derp token={token} key={index+token.type+token.value} />
};

export default class MessageTokens extends React.Component {
	render() {
		const { message } = this.props;
		const tokens = message.tokens || [{ type: "unknown", value: message.text }];
		return <MessageTextContainer>{tokens.map(mapToMessage)}</MessageTextContainer>;
	}
}

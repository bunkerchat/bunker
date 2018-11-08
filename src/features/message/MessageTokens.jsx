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

const Quote = ({token}) => (
	<MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />

	const Code = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Url = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Italics = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Bold = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Spoiler = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Strikethrough = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />
	const Word = ({token}) => <MessageTextContainer dangerouslySetInnerHTML={{ __html: token.text }} />


const tokenMap = {
	quote: token => <Quote token={token} />,
	code: token => <Code token={token} />,
	url: token => <Url token={token} />,
	italics: token => <Italics token={token} />,
	bold: token => <Bold token={token} />,
	spoiler: token => <Spoiler token={token} />,
	strikethrough: token => <Strikethrough token={token} />,
	word: token => <Word token={token} />,
	unknown: token => <Word token={token} />
};



class MessageTokens extends React.Component {
	render() {
		const { message } = this.props;
		const tokens = message.tokens;
		return tokens.map(tokenMap);
	}
}

export default connect(mapStateToProps)(MessageTokens);

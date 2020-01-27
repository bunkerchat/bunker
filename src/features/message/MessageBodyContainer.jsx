import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import theme from "../../constants/theme";
import MessageControls from "../messageControls/MessageControls.jsx";

const Container = styled.div`
	position: relative;
	flex: 1;
	min-height: 30px;
	border: solid 1px transparent;

	.right-side-controls {
		position: absolute;
		bottom: 0;
		right: 0;
		opacity: 0;
	}

	&:hover {
		background-color: ${theme.messageHoverBackground};

		.right-side-controls {
			opacity: 1;
		}
	}

	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionForegroundColor};
	}
`;

const MessageBodyContainer = ({ children, message, firstInSeries, localNick, isSelectedMessage }) => {
	const isUserMentioned = testTextForNick(message.text, localNick);

	let border = "";
	if (isSelectedMessage) {
		border = "border border-primary";
	} else if (firstInSeries) {
		border = "border-top border-light";
	}

	return (
		<Container className={`${border} ${isUserMentioned ? "mention" : ""}`}>
			{children}
			<div className="right-side-controls px-2">
				<MessageControls messageId={message._id} />
			</div>
		</Container>
	);
};

const mapStateToProps = (state, props) => ({
	localNick: state.localUser.nick,
	isSelectedMessage: state.messageControls.messageId === props.message._id
});

export default connect(mapStateToProps)(MessageBodyContainer);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
}

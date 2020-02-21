import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import theme from "../../constants/theme";
import MessageControls from "../messageControls/MessageControls.jsx";
import { getMessageText } from "./messageSelectors";
import { getMessageControlsMessageId } from "../messageControls/messageControlsSelectors";

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

const MessageBodyContainer = ({ children, messageId, messageText, firstInSeries, localNick, isSelectedMessage }) => {
	const isUserMentioned = testTextForNick(messageText, localNick);

	let border = "";
	if (isSelectedMessage) {
		border = "border border-primary";
	} else if (firstInSeries) {
		border = "border-top-light";
	}

	return (
		<Container className={`${border} ${isUserMentioned ? "mention" : ""} ml-1 ml-md-0`}>
			{children}
			<div className="right-side-controls px-2">
				<MessageControls messageId={messageId}/>
			</div>
		</Container>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	localNick: state.localUser.nick,
	messageText: getMessageText(messageId)(state),
	isSelectedMessage: getMessageControlsMessageId(state) === messageId
});

export default connect(mapStateToProps)(MessageBodyContainer);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
}

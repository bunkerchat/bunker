import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import theme from "../../constants/theme";
import { hideMessageControls, showMessageControls } from "../messageControls/messageControlsActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
	position: relative;
	flex: 1;
	min-height: 30px;
	border: solid 1px transparent;
	
	.right-side-controls {
		opacity: 0;
		position: absolute;
		top: 0;
		right: 0;
		padding-left: 150px;
		background-color: ${theme.messageHoverBackground};
	}
	
	&:hover {
		background-color: ${theme.messageHoverBackground}
	
		.right-side-controls {
			opacity: 1;
		}
	}

	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionForegroundColor};
	}
`;

const mapStateToProps = (state, props) => ({
	localNick: state.localUser.nick,
	isSelectedMessage: state.messageControls.messageId === props.messageId
});

const mapDispatchToProps = {
	showMessageControls,
	hideMessageControls
};

const MessageBodyContainer = ({ children, messageId, text, firstInSeries, localNick, isSelectedMessage, showMessageControls, hideMessageControls }) => {
	const onControlsClick = event => {
		if (!isSelectedMessage) {
			showMessageControls(messageId, event.clientX - 10, event.clientY - 10);
		} else {
			hideMessageControls();
		}
	};

	const isUserMentioned = testTextForNick(text, localNick);

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
				<button className="btn btn-link p-0" onClick={onControlsClick}>
					<FontAwesomeIcon icon="cog"/>
				</button>
			</div>
		</Container>
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageBodyContainer);

function testTextForNick(text, nick) {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
}

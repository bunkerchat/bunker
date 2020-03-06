import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hideMessageControls, messageControlEditMessage, showMessageControls } from "./messageControlsSlice";
import styled from "styled-components";
import theme from "../../constants/theme";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";
import { getLocalUserId } from "../users/usersSelectors.js";
import { getMessageAuthorId, getMessageText } from "../message/messageSelectors";
import { toggleReaction } from "../message/messageThunks";

const Container = styled.div`
	background-color: ${theme.messageHoverBackground};
	z-index: 1000;

	.btn {
		font-size: 1.2rem;
	}
`;

const MessageControls = ({
	// own props
	messageId,

	// state
	localUserId,
	messageAuthorId,

	// actions
	showEmoticonPicker,
	showMessageControls,
	messageControlEditMessage
}) => {
	const onClickEdit = () => {
		messageControlEditMessage(messageId);
	};

	const onClickReaction = event => {
		showMessageControls({ messageId });
		showEmoticonPicker(event.clientX, event.clientY, "left", true);
	};

	const localMessage = localUserId === messageAuthorId;
	return (
		<Container className="border border-primary px-3">
			{localMessage && (
				<button className="btn btn-link p-0 mr-2" onClick={onClickEdit}>
					<FontAwesomeIcon icon={["far", "edit"]} />
				</button>
			)}
			<button className="btn btn-link p-0" onClick={onClickReaction}>
				<FontAwesomeIcon icon={["far", "smile"]} />
			</button>
		</Container>
	);
};

const mapStateToProps = (state, { messageId }) => ({
	localUserId: getLocalUserId(state),
	messageText: getMessageText(messageId)(state),
	messageAuthorId: getMessageAuthorId(messageId)(state)
});

const mapDispatchToProps = {
	showEmoticonPicker,
	hideEmoticonPicker,
	toggleReaction,
	showMessageControls,
	hideMessageControls,
	messageControlEditMessage
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);

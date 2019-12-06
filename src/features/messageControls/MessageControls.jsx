import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toggleReaction } from "../message/messageActions";
import { getActiveRoomId, getLocalUser } from "../../selectors/selectors";
import { updateEditedMessage, updateText } from "../input/chatInputReducer";
import { hideMessageControls, showMessageControls } from "./messageControlsSlice";
import styled from "styled-components";
import theme from "../../constants/theme";
import { hideEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";

const Container = styled.div`
	background-color: ${theme.messageHoverBackground};	
	z-index: 1000;
	
	.btn {
		font-size: 1.2rem;
	}
`;

const MessageControls = ({ message, roomId, localUser, showEmoticonPicker, hideEmoticonPicker, toggleReaction, updateText, updateEditedMessage, showMessageControls, hideMessageControls }) => {
	const onClickEdit = () => {
		showMessageControls(message._id);
		updateText(roomId, message.text);
		updateEditedMessage(roomId, message);
	};

	const onClickReaction = event => {
		showMessageControls(message._id);
		showEmoticonPicker(event.clientX, event.clientY, "left", onEmoticonPick, onEmoticonHide, true);
	};

	const onEmoticonPick = emoticonName => {
		hideMessageControls();
		hideEmoticonPicker();
		if (emoticonName) {
			toggleReaction(message._id, emoticonName);
		}
	};

	const onEmoticonHide = () => {
		hideMessageControls();
	};

	const localMessage = localUser._id === message.author;
	return (
		<Container className="border border-primary px-3">
			{localMessage && (
				<button className="btn btn-link p-0 mr-2" onClick={onClickEdit}>
					<FontAwesomeIcon icon={["far", "edit"]}/>
				</button>
			)}
			<button className="btn btn-link p-0" onClick={onClickReaction}>
				<FontAwesomeIcon icon={["far", "smile"]}/>
			</button>
		</Container>
	);
};

const mapStateToProps = state => ({
	roomId: getActiveRoomId(state),
	localUser: getLocalUser(state)
});

const mapDispatchToProps = {
	showEmoticonPicker,
	hideEmoticonPicker,
	toggleReaction,
	updateText,
	updateEditedMessage,
	showMessageControls,
	hideMessageControls
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MessageControls);

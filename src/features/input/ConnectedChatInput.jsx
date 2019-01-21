import React from "react";
import { sendRoomMessage } from "../room/roomActions";
import { connect } from "react-redux";
import {
	hideEmoticonPicker,
	selectRightInEmoticonPicker,
	searchEmoticonPicker,
	showEmoticonPicker,
	selectLeftInEmoticonPicker,
	selectDownInEmoticonPicker,
	selectUpInEmoticonPicker
} from "../emoticon/emoticonPickerActions";
import ChatInput from "./ChatInput.jsx";
import { getActiveRoomId, getLocalMessages } from "../../selectors/selectors";
import { updateMessage } from "../message/messageActions";

const mapStateToProps = state => ({
	roomId: getActiveRoomId(state),
	emoticonPickerVisible: !!state.emoticonPicker.visible,
	selectedEmoticon: state.emoticonPicker.selected,
	localMessages: getLocalMessages(state)
});

const mapDispatchToProps = dispatch => ({
	searchEmoticonPicker: text => {
		dispatch(searchEmoticonPicker(text));
	},
	showEmoticonPicker: (x, y, onEmotionPick) => {
		dispatch(showEmoticonPicker(x, y, "right", onEmotionPick));
	},
	hideEmoticonPicker: () => {
		dispatch(hideEmoticonPicker());
	},
	selectLeftEmoticonPicker: () => {
		dispatch(selectLeftInEmoticonPicker());
	},
	selectRightEmoticonPicker: () => {
		dispatch(selectRightInEmoticonPicker());
	},
	selectUpEmoticonPicker: () => {
		dispatch(selectUpInEmoticonPicker());
	},
	selectDownEmoticonPicker: () => {
		dispatch(selectDownInEmoticonPicker());
	},
	send: (roomId, text) => {
		dispatch(sendRoomMessage(roomId, text));
	},
	edit: message => {
		dispatch(updateMessage(message));
	}
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

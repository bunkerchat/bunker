import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { updateEditedMessage, updateText } from "./chatInputReducer.js";
import { hideMessageControls } from "../messageControls/messageControlsActions.js";
import {
	getActiveRoomId,
	getCurrentRoomTextEmpty,
	getEditedMessageForCurrentRoom,
	getLocalMessages,
	getTextForCurrentRoom
} from "../../selectors/selectors.js";
import styled from "styled-components";
import theme from "../../constants/theme.js";
import {
	hideEmoticonPicker,
	searchEmoticonPicker,
	selectDownInEmoticonPicker,
	selectLeftInEmoticonPicker,
	selectRightInEmoticonPicker,
	selectUpInEmoticonPicker,
	showEmoticonPicker
} from "../emoticon/emoticonPickerActions.js";
import { sendRoomMessage } from "../room/roomActions.js";
import { updateMessage } from "../message/messageActions.js";
import { isMobile } from "../../constants/browserInfo.js";

const removeNewlines = text => text.replace(/([\n\r])+/, "");

const InputBox = styled.textarea`
	border-radius: 0;
	resize: none;
	overflow: hidden;

	&.form-control:focus {
		outline: none;
		box-shadow: none;
	}

	&.editing {
		background-color: ${theme.mentionBackgroundColor};
	}
`;

export function ChatInput({
	// state
	text,
	editedMessage,
	roomId,
	emoticonPickerVisible,
	selectedEmoticon,
	localMessages,
	updateText,
	updateEditedMessage,
	hideMessageControls,
	currentRoomTextEmpty,

	// actions
	searchEmoticonPicker,
	showEmoticonPicker,
	hideEmoticonPicker,
	selectLeftEmoticonPicker,
	selectRightEmoticonPicker,
	selectUpEmoticonPicker,
	selectDownEmoticonPicker,
	send,
	edit
}) {
	const ref = useRef();
	const inputRef = useRef();

	useEffect(
		() => {
			if (!currentRoomTextEmpty) return;
			inputRef.current.style.removeProperty("height"); // Remove extra height, if any
		},
		[currentRoomTextEmpty]
	);

	function onInputChange(event) {
		// remove  newlines here, so IOS gets a chance to autocorrect on enter
		const text = removeNewlines(event.target.value);

		if (emoticonPickerVisible) {
			const match = /:([A-z0-9\s]*)$/.exec(text);
			if (match) {
				searchEmoticonPicker(match[1]);
			}
		}

		updateText(roomId, text);

		// Automatically expand the input box height if it needs to scroll
		const { offsetHeight, scrollHeight } = inputRef.current;
		if (offsetHeight < scrollHeight) {
			inputRef.current.style.height = `${scrollHeight}px`;
		}
	}

	function onEmoticonPick(selected) {
		if (selected) {
			updateText(roomId, text.replace(/:\w*$/, `:${selected}:`));
		}
		hideEmoticonPicker();
		inputRef.current.focus();
	}

	function sendMessage() {
		// ios may have changed the text value, so get it right from the dom
		const currentText = inputRef.current.value;
		if (!currentText.trim().length) return;

		if (editedMessage) {
			edit({ ...editedMessage, text: currentText });
		} else {
			send(roomId, currentText);
		}

		updateText(roomId, "");
		updateEditedMessage(roomId, null);
		hideMessageControls();
	}

	function onSend() {
		if (!isMobile) return sendMessage();

		// so like whatever shit ios safari uses to know if a word is done being poked at
		// needs to finish before react javascript shit runs
		// hence the timeout
		// 25 ms was a wild ass guess that just works
		// if you take it out, the auto correct bullshit on ios stops working
		setTimeout(sendMessage, 25);
	}

	function onKeyDown(event) {
		if (event.key === ":") {
			if (emoticonPickerVisible) {
				hideEmoticonPicker();
			}
			// picker not visible and user isn't already typing an emoticon
			else if (!/:\w+$/.test(text)) {
				showEmoticonPicker(ref.current.offsetLeft, ref.current.offsetTop, onEmoticonPick);
			}
		} else if (/Arrow|Tab/.test(event.key) && emoticonPickerVisible) {
			event.preventDefault();

			// Move around within emoticon picker
			if (event.key === "ArrowLeft") {
				selectLeftEmoticonPicker();
			} else if (event.key === "ArrowRight") {
				selectRightEmoticonPicker();
			} else if (event.key === "ArrowUp") {
				selectUpEmoticonPicker();
			} else if (event.key === "ArrowDown") {
				selectDownEmoticonPicker();
			} else if (event.key === "Tab") {
				if (event.shiftKey) {
					selectLeftEmoticonPicker();
				} else {
					selectRightEmoticonPicker();
				}
			}
		} else if (/ArrowUp|ArrowDown/.test(event.key)) {
			event.preventDefault();

			// Edit
			const currentIndex = editedMessage ? _.findIndex(localMessages, { _id: editedMessage._id }) : -1;

			let newEditedMessage;
			if (event.key === "ArrowUp") {
				if (currentIndex > 0) {
					newEditedMessage = localMessages[currentIndex - 1];
				} else if (!newEditedMessage) {
					newEditedMessage = _.last(localMessages);
				}
			} else if (event.key === "ArrowDown") {
				if (currentIndex >= 0 && currentIndex < localMessages.length - 1) {
					newEditedMessage = localMessages[currentIndex + 1];
				}
			}

			if (newEditedMessage) {
				updateText(roomId, newEditedMessage.text);
				updateEditedMessage(roomId, newEditedMessage);
			}
		} else if (event.key === "Enter") {
			if (emoticonPickerVisible) {
				event.preventDefault();
				onEmoticonPick(selectedEmoticon);
			} else {
				if (!isMobile) {
					event.preventDefault();
				}
				onSend();
			}
		} else if (event.key === "Escape") {
			if (editedMessage) {
				updateEditedMessage(roomId, null);
			}
		}
	}

	return (
		<div ref={ref}>
			<InputBox
				ref={inputRef}
				rows="1"
				className={`form-control ${!!editedMessage ? "editing" : ""}`}
				value={text}
				onChange={onInputChange}
				onKeyDown={onKeyDown}
			/>
		</div>
	);
}

const mapStateToProps = createStructuredSelector({
	roomId: getActiveRoomId,
	emoticonPickerVisible: state => !!state.emoticonPicker.visible,
	selectedEmoticon: state => state.emoticonPicker.selected,
	localMessages: getLocalMessages,
	text: getTextForCurrentRoom,
	currentRoomTextEmpty: getCurrentRoomTextEmpty,
	editedMessage: getEditedMessageForCurrentRoom
});

const mapDispatchToProps = {
	updateText,
	updateEditedMessage,
	hideMessageControls,
	searchEmoticonPicker,
	showEmoticonPicker,
	hideEmoticonPicker,
	selectLeftEmoticonPicker: selectLeftInEmoticonPicker,
	selectRightEmoticonPicker: selectRightInEmoticonPicker,
	selectUpEmoticonPicker: selectUpInEmoticonPicker,
	selectDownEmoticonPicker: selectDownInEmoticonPicker,
	send: sendRoomMessage,
	edit: updateMessage
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

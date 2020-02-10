import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { hideMessageControls } from "../messageControls/messageControlsSlice";
import styled from "styled-components";
import theme from "../../constants/theme.js";
import { isMobile } from "../../constants/browserInfo.js";
import {
	hideEmoticonPicker,
	searchEmoticonPicker,
	selectDownEmoticonPicker,
	selectLeftEmoticonPicker,
	selectRightEmoticonPicker,
	selectUpEmoticonPicker,
	showEmoticonPicker
} from "../emoticon/emoticonPickerActions";
import { sendRoomMessage, sendTypingNotification } from "../rooms/roomsThunks";
import { getLocalMessages } from "../message/messageSelectors.js";
import { getAppendTextForCurrentRoom, getEditedMessageForCurrentRoom } from "./chatInputSelectors.js";
import { getActiveRoomId } from "../room/roomSelectors.js";
import { getNewReplaceText, getNewText, getOldReplaceText } from "./chatInputSelectors";
import { setAppendText, setNewText, setReplaceText, updateEditedMessage } from "./chatInputThunks";
import { updateMessage } from "../message/messageThunks";
import { emoticonPicked } from "../emoticon/emoticonPickerThunks";

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
	roomId,
	emoticonPickerVisible,
	selectedEmoticon,
	localMessages,
	appendText,
	editedMessage,
	newText,
	oldReplaceText,
	newReplaceText,

	// actions
	updateEditedMessage,
	hideMessageControls,
	searchEmoticonPicker,
	showEmoticonPicker,
	hideEmoticonPicker,
	selectLeftEmoticonPicker,
	selectRightEmoticonPicker,
	selectUpEmoticonPicker,
	selectDownEmoticonPicker,
	sendRoomMessage,
	updateMessage,
	sendTypingNotification,
	setNewText,
	setAppendText,
	emoticonPicked
}) {
	const ref = useRef();
	const inputRef = useRef();

	const replaceText = (old, text) => {
		inputRef.current.value = inputRef.current.value.replace(old, text);
		inputRef.current.focus();
	};

	const appendNewText = text => {
		inputRef.current.value += text;
		inputRef.current.focus();
	};

	const setText = text => {
		inputRef.current.value = text;
		inputRef.current.focus();
	};

	useEffect(
		() => {
			if (!editedMessage?.text) return;
			setText(editedMessage?.text);
		},
		[editedMessage?.text]
	);

	useEffect(
		() => {
			if (!appendText) return;

			appendNewText(appendText);
			setAppendText("");
		},
		[appendText]
	);

	useEffect(
		() => {
			if (!newText) return;
			setText(newText);
			setNewText("");
		},
		[newText]
	);

	useEffect(
		() => {
			if (!newReplaceText) return;
			replaceText(oldReplaceText, newReplaceText);
			setReplaceText("", "");
		},
		[newReplaceText]
	);

	function sendMessage() {
		// ios may have changed the text value, so get it right from the dom
		const currentText = removeNewlines(inputRef.current.value);
		if (!currentText.trim().length) {
			setText("");
			return;
		}

		if (editedMessage) {
			updateMessage({ ...editedMessage, text: currentText });
		} else {
			sendRoomMessage(roomId, currentText);
		}

		setText("");

		updateEditedMessage(null);
		hideMessageControls();

		// hack for ios
		setTimeout(() => {
			// Remove extra height, if any
			inputRef.current.style.removeProperty("height");
		});
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

	function handleOpenCloseEmoticon() {
		if (emoticonPickerVisible) {
			hideEmoticonPicker();
		}
		// picker not visible and user isn't already typing an emoticon
		else if (!/:\w+$/.test(inputRef.current.value)) {
			showEmoticonPicker(ref.current.offsetLeft, ref.current.offsetTop);
		}
	}

	function handleEmoticonTabArrow(event) {
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
	}

	function handleMessageNavigation(event) {
		event.preventDefault();

		// updateMessage
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
			updateEditedMessage(newEditedMessage._id);
		}
	}

	function handleEnterKey(event) {
		if (emoticonPickerVisible) {
			event.preventDefault();
			emoticonPicked(selectedEmoticon);
		} else {
			if (!isMobile) {
				event.preventDefault();
			}
			onSend();
		}
	}

	function onKeyDown(event) {
		const { key } = event;
		if (key === ":") {
			handleOpenCloseEmoticon();
		} else if (key === "Backspace" && _.last(inputRef.current.value) === ":" && emoticonPickerVisible) {
			hideEmoticonPicker();
		} else if (/Arrow|Tab/.test(key) && emoticonPickerVisible) {
			handleEmoticonTabArrow(event);
		} else if (/ArrowUp|ArrowDown/.test(key)) {
			handleMessageNavigation(event);
		} else if (key === "Enter") {
			handleEnterKey(event);
		} else if (key === "Escape") {
			if (editedMessage) {
				updateEditedMessage(null);
			}
		} else if (key.length === 1 && /[A-z0-9]/.test(key)) {
			sendTypingNotification();
		}
	}

	function onInputChange(event) {
		// remove  newlines here, so IOS gets a chance to autocorrect on enter
		const cleanText = removeNewlines(event.target.value);

		if (emoticonPickerVisible) {
			const match = /:([A-z0-9\s]*)$/.exec(cleanText);
			if (match) {
				searchEmoticonPicker(match[1]);
			}
		}

		// TODO: add support for shift+enter to add more lines
		if (event.nativeEvent.inputType === "insertLineBreak") {
			event.preventDefault();
		}

		// Automatically expand the input box height if it needs to scroll
		const { offsetHeight, scrollHeight } = inputRef.current;
		if (offsetHeight < scrollHeight) {
			inputRef.current.style.height = `${scrollHeight}px`;
		}
	}

	return (
		<div ref={ref}>
			<InputBox
				ref={inputRef}
				rows="1"
				className={`form-control ${!!editedMessage ? "editing" : ""}`}
				onChange={onInputChange}
				onKeyDown={onKeyDown}
			/>
		</div>
	);
}

const mapStateToProps = state => ({
	roomId: getActiveRoomId(state),
	emoticonPickerVisible: !!state.emoticonPicker.visible,
	selectedEmoticon: state.emoticonPicker.selected,
	localMessages: getLocalMessages(state),
	appendText: getAppendTextForCurrentRoom(state),
	editedMessage: getEditedMessageForCurrentRoom(state),
	newText: getNewText(state),
	oldReplaceText: getOldReplaceText(state),
	newReplaceText: getNewReplaceText(state)
});

const mapDispatchToProps = {
	updateEditedMessage,
	hideMessageControls,
	searchEmoticonPicker,
	showEmoticonPicker,
	hideEmoticonPicker,
	selectLeftEmoticonPicker,
	selectRightEmoticonPicker,
	selectUpEmoticonPicker,
	selectDownEmoticonPicker,
	sendRoomMessage,
	updateMessage,
	sendTypingNotification,
	setNewText,
	emoticonPicked,
	setAppendText,
	setReplaceText
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

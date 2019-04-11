import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";
import { updateEditedMessage, updateText } from "./chatInputReducer";
import { connect } from "react-redux";

const removeNewlines = text => text.replace(/(\n|\r)+/, "");

const InputBox = styled.textarea`
	border-radius: 0;
	resize: none;
	white-space: nowrap;

	&.form-control:focus {
		outline: none;
		box-shadow: none;
	}

	&.editing {
		background-color: ${theme.mentionBackgroundColor};
	}
`;

const mapStateToProps = (state, props) => {
	return state.chatInput.byRoom[props.roomId] || { text: "", editedMessage: null };
};

const mapDispatchToProps = {
	updateText,
	updateEditedMessage
};

export class ChatInput extends React.Component {
	ref = React.createRef();

	inputRef = React.createRef();

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.props.text !== prevProps.text && this.inputRef.current) {
			this.inputRef.current.focus();
		}
	}

	onInputChange = event => {
		// remove  newlines here, so IOS gets a chance to autocorrect on enter
		const text = removeNewlines(event.target.value);

		if (this.props.emoticonPickerVisible) {
			const match = /:([A-z0-9\s]*)$/.exec(text);
			if (match) {
				this.props.searchEmoticonPicker(match[1]);
			}
		}

		this.props.updateText(this.props.roomId, text);
	};

	onKeyDown = event => {
		if (event.key === ":") {
			if (this.props.emoticonPickerVisible) {
				this.props.hideEmoticonPicker();
			}
			// picker not visible and user isn't already typing an emoticon
			else if (!/:\w+$/.test(this.props.text)) {
				this.props.showEmoticonPicker(this.ref.current.offsetLeft, this.ref.current.offsetTop, this.onEmoticonPick);
			}
		} else if (/Arrow|Tab/.test(event.key) && this.props.emoticonPickerVisible) {
			event.preventDefault();

			// Move around within emoticon picker
			if (event.key === "ArrowLeft") {
				this.props.selectLeftEmoticonPicker();
			} else if (event.key === "ArrowRight") {
				this.props.selectRightEmoticonPicker();
			} else if (event.key === "ArrowUp") {
				this.props.selectUpEmoticonPicker();
			} else if (event.key === "ArrowDown") {
				this.props.selectDownEmoticonPicker();
			} else if (event.key === "Tab") {
				if (event.shiftKey) {
					this.props.selectLeftEmoticonPicker();
				} else {
					this.props.selectRightEmoticonPicker();
				}
			}
		} else if (/ArrowUp|ArrowDown/.test(event.key)) {
			event.preventDefault();

			// Edit
			const currentIndex = this.props.editedMessage
				? _.findIndex(this.props.localMessages, { _id: this.props.editedMessage._id })
				: -1;

			let editedMessage;
			if (event.key === "ArrowUp") {
				if (currentIndex > 0) {
					editedMessage = this.props.localMessages[currentIndex - 1];
				} else if (!this.props.editedMessage) {
					editedMessage = _.last(this.props.localMessages);
				}
			} else if (event.key === "ArrowDown") {
				if (currentIndex >= 0 && currentIndex < this.props.localMessages.length - 1) {
					editedMessage = this.props.localMessages[currentIndex + 1];
				}
			}

			if (editedMessage) {
				this.props.updateText(this.props.roomId, editedMessage.text);
				this.props.updateEditedMessage(this.props.roomId, editedMessage);
			}
		} else if (event.key === "Enter") {
			if (this.props.emoticonPickerVisible) {
				event.preventDefault();
				this.onEmoticonPick(this.props.selectedEmoticon);
			} else {
				this.onSend();
			}
		} else if (event.key === "Escape") {
			if (this.props.editedMessage) {
				this.props.updateEditedMessage(this.props.roomId, null);
			}
		}
	};

	onSend = () => {
		// so like whatever shit ios safari uses to know if a word is done being poked at
		// needs to finish before react javascript shit runs
		// hence the timeout
		// 25 ms was a wild ass guess that just works
		// if you take it out, the auto correct bullshit on ios stops working
		setTimeout(() => {
			const { text, editedMessage, edit, send, roomId } = this.props;

			if (!text.trim().length) return;

			if (editedMessage) {
				edit({ ...editedMessage, text });
			} else {
				send(roomId, text);
			}

			this.props.updateText(this.props.roomId, "");
			this.props.updateEditedMessage(this.props.roomId, null);
		}, 25);
	};

	onEmoticonPick = selected => {
		if (selected) {
			this.props.updateText(this.props.roomId, this.props.text.replace(/:\w*$/, `:${selected}:`))
		}
		this.props.hideEmoticonPicker();
		this.inputRef.current.focus();
	};

	render() {
		return (
			<div ref={this.ref}>
				<InputBox
					ref={this.inputRef}
					rows="1"
					className={`form-control ${!!this.props.editedMessage ? "editing" : ""}`}
					value={this.props.text}
					onChange={this.onInputChange}
					onKeyDown={this.onKeyDown}
				/>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatInput);

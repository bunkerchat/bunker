import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

const removeLeadingTrailingEmptySpace = text => text.replace(/^(\s|\n|\r)+/, "").replace(/([\n\r])+$/, "");

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

export default class ChatInput extends React.PureComponent {
	ref = React.createRef();

	inputRef = React.createRef();

	state = {
		text: "",
		editedMessage: null
	};

	onInputChange = event => {
		// remove leading newlines here, so IOS gets a chance to autocorrect on enter
		const text = removeLeadingTrailingEmptySpace(event.target.value);

		if (this.props.emoticonPickerVisible) {
			const match = /:([A-z0-9\s]*)$/.exec(text);
			if (match) {
				this.props.searchEmoticonPicker(match[1]);
			}
		}

		this.setState({ text });
	};

	onKeyDown = event => {
		if (event.key === ":") {
			if (this.props.emoticonPickerVisible) {
				this.props.hideEmoticonPicker();
			}
			// picker not visible and user isn't already typing an emoticon
			else if (!/:\w+$/.test(this.state.text)) {
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
			const currentIndex = this.state.editedMessage
				? _.findIndex(this.props.localMessages, { _id: this.state.editedMessage._id })
				: -1;

			let editedMessage;
			if (event.key === "ArrowUp") {
				if (currentIndex > 0) {
					editedMessage = this.props.localMessages[currentIndex - 1];
				} else if (!this.state.editedMessage) {
					editedMessage = _.last(this.props.localMessages);
				}
			} else if (event.key === "ArrowDown") {
				if (currentIndex >= 0 && currentIndex < this.props.localMessages.length - 1) {
					editedMessage = this.props.localMessages[currentIndex + 1];
				}
			}

			if (editedMessage) {
				this.setState({ text: editedMessage.text, editedMessage });
			}
		} else if (event.key === "Enter") {
			// no event prevent default to allow IOS a chance to autocorrect. Handled in onInputChange
			if (this.props.emoticonPickerVisible) {
				this.onEmoticonPick(this.props.selectedEmoticon);
			} else {
				this.onSend();
			}
		} else if (event.key === "Escape") {
			if (this.state.editedMessage) {
				this.setState({ editedMessage: null });
			}
		}
	};

	onSend = () => {
		const { text, editedMessage } = this.state;
		const { edit, send, roomId } = this.props;

		if (!text.trim().length) return;

		if (editedMessage) {
			edit({ ...editedMessage, text });
		} else {
			send(roomId, text);
		}

		this.setState({ text: "", editedMessage: null });
	};

	onEmoticonPick = selected => {
		if (selected) {
			this.setState({ text: this.state.text.replace(/:\w*$/, `:${selected}:`) });
		}
		this.props.hideEmoticonPicker();
		this.inputRef.current.focus();
	};

	render() {
		return (
			<div ref={this.ref}>
				<InputBox
					innerRef={this.inputRef}
					rows="1"
					className={`form-control ${!!this.state.editedMessage ? "editing" : ""}`}
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyUp={this.onKeyDown}
				/>
			</div>
		);
	}
}

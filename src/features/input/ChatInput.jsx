import React from "react";
import styled from "styled-components";
import theme from "../../constants/theme";

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
	constructor(props) {
		super(props);
		this.state = {
			ref: React.createRef(),
			inputRef: React.createRef(),
			text: "",
			editedMessage: null
		};
	}

	onInputChange = event => {
		const text = event.target.value;

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
				this.props.showEmoticonPicker(
					this.state.ref.current.offsetLeft,
					this.state.ref.current.offsetTop,
					this.onEmoticonPick
				);
			}
		} else if (/Arrow|Tab/.test(event.key)) {
			event.preventDefault();

			if (this.props.emoticonPickerVisible) {
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
			} else {
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
			}
		} else if (event.key === "Enter") {
			event.preventDefault();

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
		if (this.state.text.trim().length > 0) {
			if (this.state.editedMessage) {
				this.props.edit({ ...this.state.editedMessage, text: this.state.text });
			} else {
				this.props.send(this.props.roomId, this.state.text);
			}
			this.setState({ text: "", editedMessage: null });
		}
	};

	onEmoticonPick = selected => {
		this.setState({ text: this.state.text.replace(/:\w*$/, `:${selected}:`) });
		this.props.hideEmoticonPicker();
		this.state.inputRef.current.focus();
	};

	render() {
		return (
			<div ref={this.state.ref}>
				<InputBox
					innerRef={this.state.inputRef}
					rows="1"
					className={`form-control ${!!this.state.editedMessage ? "editing" : ""}`}
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyDown={this.onKeyDown}
				/>
			</div>
		);
	}
}

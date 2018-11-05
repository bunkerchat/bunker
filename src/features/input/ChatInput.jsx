import React from "react";
import styled from "styled-components";
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

const InputBox = styled.textarea`
	border-radius: 0;
	resize: none;
	white-space: nowrap;

	&.form-control:focus {
		outline: none;
		box-shadow: none;
	}
`;

const mapStateToProps = state => ({
	emoticonPickerVisible: !!state.emoticonPicker.visible,
	selectedEmoticon: state.emoticonPicker.selected
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
	}
});

class ChatInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			ref: React.createRef(),
			inputRef: React.createRef(),
			text: ""
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
			} else {
				this.props.showEmoticonPicker(
					this.state.ref.current.offsetLeft,
					this.state.ref.current.offsetTop,
					this.onEmoticonPick
				);
			}
		} else if (/Arrow|Tab/.test(event.key) && this.props.emoticonPickerVisible) {
			event.preventDefault();

			// Move around within emoticon picker
			if (event.key === "ArrowLeft") {
				this.props.selectLeftEmoticonPicker();
			} else if (event.key === "ArrowRight" || event.key === "Tab") {
				this.props.selectRightEmoticonPicker();
			} else if (event.key === "ArrowUp") {
				this.props.selectUpEmoticonPicker();
			} else if (event.key === "ArrowDown") {
				this.props.selectDownEmoticonPicker();
			}
		} else if (event.key === "Enter") {
			event.preventDefault();

			if (this.props.emoticonPickerVisible) {
				this.onEmoticonPick(this.props.selectedEmoticon);
			} else {
				this.onSend();
			}
		}
	};

	onSend = () => {
		if (this.state.text.trim().length > 0) {
			this.props.send(this.props.roomId, this.state.text);
			this.setState({ text: "" });
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
					className="form-control"
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyDown={this.onKeyDown}
				/>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

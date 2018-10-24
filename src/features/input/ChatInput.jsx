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
	emoticonPickerVisible: !!state.emoticonPicker.target,
	selectedEmoticon: state.emoticonPicker.selected
});

const mapDispatchToProps = dispatch => ({
	searchEmoticonPicker: text => {
		dispatch(searchEmoticonPicker(text));
	},
	showEmoticonPicker: target => {
		dispatch(showEmoticonPicker(target));
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
			text: ""
		};
	}

	onInputChange = event => {
		const text = event.target.value;

		if (this.props.emoticonPickerVisible) {
			const match = /:(\w+)$/.exec(text);
			if (match) {
				this.props.searchEmoticonPicker(match[1]);
			}
		}

		this.setState({ text });
	};

	onKeyDown = event => {
		if (event.key === "Enter") {
			event.preventDefault();

			if (this.props.emoticonPickerVisible) {
				this.setState({ text: this.state.text.replace(/:\w*$/, `:${this.props.selectedEmoticon}:`) });
				this.props.hideEmoticonPicker();
			} else {
				this.onSend();
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
		}
	};

	onKeyPress = event => {
		if (event.key === ":") {
			// Do a timeout here so emoticon picker doesn't prevent : from being typed
			setTimeout(() => {
				if (this.props.emoticonPickerVisible) {
					this.props.hideEmoticonPicker();
				} else {
					this.props.showEmoticonPicker(this.state.ref);
				}
			});
		}
	};

	onSend = () => {
		if (this.state.text.trim().length > 0) {
			this.props.send(this.props.roomId, this.state.text);
			this.setState({ text: "" });
		}
	};

	render() {
		return (
			<div ref={this.state.ref}>
				<InputBox
					rows="1"
					className="form-control"
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyDown={this.onKeyDown}
					onKeyPress={this.onKeyPress}
				/>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

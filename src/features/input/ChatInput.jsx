import React from "react";
import styled from "styled-components";
import { sendRoomMessage } from "../room/roomActions";
import { connect } from "react-redux";
import {
	hideEmoticonPicker,
	selectRightInEmoticonPicker,
	searchEmoticonPicker,
	showEmoticonPicker,
	selectLeftInEmoticonPicker
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
	emoticonPickerSearchText: state.emoticonPicker.search
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
		this.setState({ text: event.target.value });
	};

	onKeyDown = event => {
		console.log(event.key);
		if (event.key === "Enter") {
			event.preventDefault();
			this.onSend();
		} else if (this.props.emoticonPickerVisible && /Arrow/.test(event.key)) {
			// Move around within emoticon picker
			if (event.key === "ArrowLeft") {
				this.props.selectLeftEmoticonPicker();
			} else if (event.key === "ArrowRight") {
				this.props.selectRightEmoticonPicker();
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
		} else if (this.props.emoticonPickerVisible) {
			this.props.searchEmoticonPicker(`${this.props.emoticonPickerSearchText || ""}${event.key}`);
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

import React from "react";
import styled from "styled-components";
import { sendRoomMessage } from "../room/roomActions";
import { connect } from "react-redux";
import { searchEmoticonPicker, showEmoticonPicker } from "../emoticon/emoticonPickerActions";

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
	emoticonPickerVisible: !!state.emoticonPicker.target
});

const mapDispatchToProps = dispatch => ({
	searchEmoticonPicker: text => {
		dispatch(searchEmoticonPicker(text));
	},
	showEmoticonPicker: target => {
		dispatch(showEmoticonPicker(target));
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
			emoticonSearching: false,
			text: ""
		};
	}

	onInputChange = event => {
		this.setState({ text: event.target.value });
	};

	onKeyDown = event => {
		if (event.key === ":") {
			if (!this.state.emoticonSearching) {
				this.setState({ emoticonSearching: true });

				if (!this.props.emoticonPickerVisible) {
					// Do a timeout here so emoticon picker doesn't prevent : from being typed
					setTimeout(() => {
						this.props.showEmoticonPicker(this.state.ref);
					});
				}
			}

		} else if (event.key === "Enter") {
			event.preventDefault();
			this.onSend();
		}
		else {
			this.props.searchEmoticonPicker(this.state.text);
		}
	};

	onSend = () => {
		if (this.state.text.trim().length > 0) {
			this.props.send(this.props.roomId, this.state.text);
			this.setState({ text: "", emoticonSearching: false });
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
				/>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatInput);

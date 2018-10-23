import React from "react";
import styled from "styled-components";
import { sendRoomMessage } from "../room/roomActions";
import { connect } from "react-redux";
import ChatButtons from "./ChatButtons.jsx";

const InputBox = styled.textarea`
	border-radius: 0;
	resize: none;
	white-space: nowrap;

	&.form-control:focus {
		outline: none;
		box-shadow: none;
	}
`;

const mapDispatchToProps = dispatch => ({
	send: (roomId, text) => {
		dispatch(sendRoomMessage(roomId, text));
	}
});

class ChatInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			text: ""
		};
	}

	onInputChange = event => {
		this.setState({ text: event.target.value });
	};

	onKeyPress = event => {
		if (event.key === "Enter") {
			event.preventDefault();
			this.onSend();
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
			<div>
				<InputBox
					rows="1"
					className="form-control"
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyPress={this.onKeyPress}
				/>
				<ChatButtons />
			</div>
		);
	}
}

export default connect(
	null,
	mapDispatchToProps
)(ChatInput);

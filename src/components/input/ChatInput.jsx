import React from "react";
import styled from "styled-components";
import { sendRoomMessage } from "../../actions/room";
import { connect } from "react-redux";
import ChatButtons from "./ChatButtons.jsx";

const ChatInputContainer = styled.div`
	position: fixed;
	bottom: 0;
	width: 100%;
`;

const InputBox = styled.textarea`
	border-radius: 0;
	resize: none;
	white-space: nowrap;
`;

const mapDispatchToProps = dispatch => ({
	send: (roomId, text) => {
		dispatch(sendRoomMessage(roomId, text));
	}
});

class ChatInput extends React.Component {
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
			<ChatInputContainer className="bg-white">
				<InputBox
					rows="1"
					className="form-control"
					value={this.state.text}
					onChange={this.onInputChange}
					onKeyPress={this.onKeyPress}
				/>
				<ChatButtons onSend={this.onSend} />
			</ChatInputContainer>
		);
	}
}

export default connect(
	null,
	mapDispatchToProps
)(ChatInput);

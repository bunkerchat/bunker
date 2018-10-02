import React from "react";
import styled from "styled-components";
import { sendRoomMessage } from "../room/roomActions";
import { connect } from "react-redux";
import ChatButtons from "./ChatButtons.jsx";
import theme from "../../constants/theme";

// position fixed is the smoothest way to accomplish a truly fixed bottom bar I think
// note the message list has some extra padding to account for this element floating above it
// uses two widths:
// one for xs, sm (max width input) and one for md+ (smaller to account for member list)
const ChatInputContainer = styled.div`
	position: fixed;
	bottom: 0;
	width: calc(100vw);
	background-color: ${theme.chatButtonBackground};
	z-index: 2000;

	@media (min-width: 768px) {
		width: calc(100vw - ${theme.memberList}px);
	}
`;

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
			<ChatInputContainer>
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

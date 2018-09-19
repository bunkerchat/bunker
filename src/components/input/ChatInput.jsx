import React from "react";
import styled from "styled-components";
import {sendRoomMessage} from "../../actions/room";
import {connect} from "react-redux";

const ChatInputContainer = styled.div`
	position: fixed;
	bottom: 0;
	width: 100%;
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
		}
	}

	onInputChange = (event) => {
		this.setState({text: event.target.value});
	};

	onKeyPress = (event) => {
		if(event.key === 'Enter') {
			this.onSend();
		}
	};

	onSend = () => {
		this.props.send(this.props.roomId, this.state.text);
		this.setState({text: ""});
	};

	render() {
		return (
			<ChatInputContainer className="bg-white">
				<input type="text"
							 className="form-control"
							 value={this.state.text}
							 onChange={this.onInputChange}
							 onKeyPress={this.onKeyPress}/>
				<div className="row">
					<div className="col">
						<button className="btn btn-link">
							Emoticons
						</button>
					</div>
					<div className="col text-right">
						<button className="btn btn-link">
							Upload
						</button>
						<button type="button" className="btn btn-success" onClick={this.onSend}>
							Send
						</button>
					</div>
				</div>
			</ChatInputContainer>
		)
	}
}

export default connect(null, mapDispatchToProps)(ChatInput);

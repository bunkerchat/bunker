import React from "react";
import Message from "./Message.jsx";
import styled from "styled-components";
import userId from "../../constants/userId";
import { clearRoomMessages } from "../../actions/room";
import { maxMessages } from "../../constants/chat";
import theme from "../../constants/theme";
import { connect } from "react-redux";
import SystemMessage from "./SystemMessage.jsx";

const MessageListContainer = styled.div`
	min-height: calc(100vh - 80px - ${theme.top} + 10px);
	padding-bottom: 70px;
`;

const mapDispatchToProps = dispatch => ({
	clearMessages: roomId => {
		dispatch(clearRoomMessages(roomId));
	}
});

class MessageList extends React.Component {
	componentDidMount() {
		// Scroll to bottom on load
		window.scrollTo(0, document.body.scrollHeight);
	}

	getSnapshotBeforeUpdate(prevProps) {
		// If adding messages: snapshot if we are at bottom prior to message getting added to DOM
		if (this.props.messages.length > prevProps.messages.length) {
			return window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
		}
		return false;
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const wasPreviouslyAtBottom = snapshot;
		const lastMessage = _.last(this.props.messages) || {};
		const previousLastMessage = _.last(prevProps.messages) || {};
		const lastMessageIsNewAndLocal =
			lastMessage._id !== previousLastMessage._id && (lastMessage.author && lastMessage.author === userId);

		// Scroll if new message from local user or if the message list is already scrolled to bottom
		if (lastMessageIsNewAndLocal || wasPreviouslyAtBottom) {
			window.scrollTo(0, document.body.offsetHeight);

			// Also, if we're at the bottom, continually prune messages
			if (this.props.messages.length > maxMessages) {
				this.props.clearMessages(this.props.roomId);
			}
		}
	}

	render() {
		const { messages } = this.props;
		return (
			<MessageListContainer className="bg-light">
				{messages.map(
					(message, index) =>
						message.author ? (
							<Message message={message} previous={messages[index - 1]} key={message._id} />
						) : (
							<SystemMessage message={message} key={message._id} />
						)
				)}
			</MessageListContainer>
		);
	}
}

export default connect(
	null,
	mapDispatchToProps
)(MessageList);

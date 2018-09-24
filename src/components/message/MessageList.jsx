import React from 'react';
import Message from './Message.jsx';
import styled from 'styled-components';
import {loadRoomMessages} from "../../actions/room";
import {connect} from "react-redux";

const MessageListContainer = styled.div`
	padding-bottom: 80px;
`;

const mapDispatchToProps = dispatch => ({
	loadMessages: (roomId, skip) => {
		dispatch(loadRoomMessages(roomId, skip))
	}
});

class MessageList extends React.Component {

	onScroll = _.throttle(() => {
		if (window.scrollY < 50) {
			this.props.loadMessages(this.props.roomId, this.props.messages.length);
		}
	}, 500);

	componentDidMount() {
		window.scrollTo(0, document.body.scrollHeight);
		window.addEventListener('scroll', this.onScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll);
	}

	componentDidUpdate() {
		// Scroll to bottom everytime this updates
		// todo this will cause a lot of unnecessary scrolling, work in progress
		// todo don't scroll for other people's messages unless at the bottom already or for edits
		window.scrollTo(0, document.body.scrollHeight);
	}

	render() {
		const {messages} = this.props;
		return (
			<MessageListContainer className="bg-light">
				{messages.map((message, index) => (
					<Message message={message}
									 previous={messages[index - 1]}
									 key={message._id}/>
				))}
			</MessageListContainer>
		)
	}
}

export default connect(null, mapDispatchToProps)(MessageList);

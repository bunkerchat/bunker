import React from 'react';
import Message from './Message.jsx';
import styled from 'styled-components';

const MessageListContainer = styled.div`
	padding-bottom: 80px;
`;

export default class MessageList extends React.Component {
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

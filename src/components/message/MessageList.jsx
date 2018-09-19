import React from 'react';
import Message from "./Message.jsx";
import styled from "styled-components";

const MessageListContainer = styled.div`
	padding-bottom: 80px;
`;

export default class MessageList extends React.Component {
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

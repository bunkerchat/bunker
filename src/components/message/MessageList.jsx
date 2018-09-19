import React from 'react';
import Message from "./Message.jsx";

export default class MessageList extends React.Component {
	render() {
		const {messages} = this.props;
		return (
			<div className="container-fluid bg-light">
				{messages.map((message, index) => (
					<Message message={message}
									 previous={messages[index - 1]}
									 key={message._id}/>
				))}
			</div>
		)
	}
}

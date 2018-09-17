import React from 'react';
import Message from "./Message.jsx";

export default class MessageList extends React.Component {
	render() {
		const {messages} = this.props;
		return (
			<div>
				{messages.map(message => <Message message={message}/>)}
			</div>
		)
	}
}

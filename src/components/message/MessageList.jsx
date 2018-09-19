import React from 'react';
import Message from "./Message.jsx";

export default class MessageList extends React.Component {
	render() {
		const {messages} = this.props;
		return (
			<div className="container-fluid">
				{messages.map(message => <Message message={message} key={message._id}/>)}
			</div>
		)
	}
}

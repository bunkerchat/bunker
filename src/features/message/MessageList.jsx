import React from "react";
import Message from "./Message.jsx";
import SystemMessage from "./SystemMessage.jsx";

export default class MessageList extends React.Component {
	render() {
		const { messages } = this.props;
		return (
			<div>
				{messages.map((message, index) => (
					<div id={message._id} key={message._id}>
						{message.author ? (
							<Message message={message} previous={messages[index - 1]} />
						) : (
							<SystemMessage message={message} />
						)}
					</div>
				))}
			</div>
		);
	}
}

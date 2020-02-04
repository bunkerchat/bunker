import React from "react";
import Message from "./Message.jsx";
import SystemMessage from "./SystemMessage.jsx";

const MessageList = ({ messages }) => {
	return (
		<div>
			{messages.map((message, index) => (
				<div id={message._id} key={message._id}>
					{message.author ? (
						<Message messageId={message._id} previousMessageId={messages[index - 1]?._id} />
					) : (
						<SystemMessage message={message} />
					)}
				</div>
			))}
		</div>
	);
};

MessageList.defaultProps = {
	messages: []
};

export default MessageList;

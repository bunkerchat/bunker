import React from "react";
import MessageAuthor from "./MessageAuthor.jsx";
import MessageBody from "./MessageBody.jsx";

export default class Message extends React.PureComponent {
	render() {
		const { message, previous } = this.props;
		const firstInSeries = !previous || !previous.author || !message.author || previous.author !== message.author;

		return (
			<div className={`d-flex ${firstInSeries ? "mt-3 mt-md-0" : ""}`}>
				<MessageAuthor authorId={message.author} firstInSeries={firstInSeries} />
				<MessageBody message={message} firstInSeries={firstInSeries} />
			</div>
		);
	}
}

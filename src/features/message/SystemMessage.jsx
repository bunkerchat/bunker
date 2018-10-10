import React from "react";
import MessageText from "./MessageText.jsx";

export default class SystemMessage extends React.PureComponent {
	render() {
		const { message } = this.props;
		return (
			<div className="p-2">
				<MessageText text={message.text} />
			</div>
		);
	}
}

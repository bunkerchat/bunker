import React from "react";
import MessageTokens from "./MessageTokens.jsx";

export default class SystemMessage extends React.PureComponent {
	render() {
		const { message } = this.props;
		return (
			<div className="p-2">
				<MessageTokens message={message} />
			</div>
		);
	}
}

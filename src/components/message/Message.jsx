import React from "react";

export default class Message extends React.Component {
	render() {
		const {message} = this.props;
		return (
			<div>
				<p>{message.text}</p>
			</div>
		)
	}
}

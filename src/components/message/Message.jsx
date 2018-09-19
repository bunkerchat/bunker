import React from "react";

export default class Message extends React.Component {
	render() {
		const {message} = this.props;
		return (
			<div className="row">
				<div className="col-2">
					{message.author}
				</div>
				<div className="col">
					{message.text}
				</div>
			</div>
		)
	}
}

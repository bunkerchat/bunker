import React from "react";

export default class SystemMessage extends React.PureComponent {
	render() {
		const { message } = this.props;
		return <div className="p-2">{message.text}</div>;
	}
}

import React from "react";
import TimeAgo from "react-timeago";

const formatter = (value, unit, suffix) => {
	if (unit === "second") {
		value = "a few";
	}
	if (value !== 1) {
		unit += "s";
	}
	return `${value} ${unit} ${suffix}`;
};

export default class MessageTimeAgo extends React.PureComponent {
	render() {
		return <TimeAgo date={this.props.date} minPeriod={60} formatter={formatter} />;
	}
}

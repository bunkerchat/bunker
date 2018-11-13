import React from "react";
import styled from "styled-components";

const ColoredStatus = styled.div`
	width: 3px;
	height: inherit;
	background-image: none;

	&.present {
		background-image: linear-gradient(to bottom, #00ff00 0%, #00bd00 100%);
	}

	&.away {
		background-image: linear-gradient(to bottom, #ffe909 0%, #ffc22f 100%);
	}
`;

export default class UserStatus extends React.Component {
	shouldComponentUpdate(prevProps) {
		return this.props.user.connected !== prevProps.user.connected || this.props.user.present !== prevProps.user.present;
	}

	render() {
		const { user } = this.props;
		const presentClass = user.connected ? (user.present ? "present" : "away") : "";
		return <ColoredStatus className={presentClass} />;
	}
}

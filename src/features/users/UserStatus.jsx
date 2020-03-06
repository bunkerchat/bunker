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

export default class UserStatus extends React.PureComponent {
	render() {
		const { connected, present } = this.props;
		const presentClass = connected ? (present ? "present" : "away") : "";
		return <ColoredStatus className={presentClass} />;
	}
}

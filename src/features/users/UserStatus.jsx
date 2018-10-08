import React from "react";
import styled from "styled-components";

const ColoredStatus = styled.div`
	width: 4px;
	height: inherit;
	background-image: none;
	
	&.present {
		background-image: linear-gradient(to bottom, #00FF00 0%, #00BD00 100%);
	}
		
	&.away {
		background-image: linear-gradient(to bottom, #ffe909 0%, #FFC22F 100%);
	}
`;

export default class MessageAuthor extends React.Component {
	render() {
		const { user } = this.props;
		const presentClass = user.connected ? user.present ? 'present' : 'away' : '';
		return <ColoredStatus className={presentClass}/>;
	}
}

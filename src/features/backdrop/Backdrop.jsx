import React from "react";
import styled from "styled-components";

const FullScreen = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
`;

export default class Backdrop extends React.PureComponent {
	onClick = event => {
		event.stopPropagation();
		this.props.onClick();
	};

	render() {
		return <FullScreen onClick={this.onClick} />;
	}
}

import React from "react";
import styled from "styled-components";

const Background = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;

export default class Backdrop extends React.Component {
	render() {
		return <Background onClick={this.props.onClick} />;
	}
}

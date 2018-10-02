import React from "react";
import styled from "styled-components";

const SystemMessageContainer = styled.div`
	display: inline-block;
	padding: 10px;
`;

export default class SystemMessage extends React.Component {
	render() {
		const { message } = this.props;
		return <SystemMessageContainer>{message.text}</SystemMessageContainer>;
	}
}

import React from "react";
import styled from "styled-components";
import MessageText from "./MessageText.jsx";

const MessageBodyContainer = styled.div`
	display: inline-block;
	padding: 0 10px;
	overflow: hidden;
`;

export default class MessageBody extends React.Component {
	render() {
		const { message, author } = this.props;
		return (
			<MessageBodyContainer>
				{this.props.firstInSeries && <h6>{author.nick}</h6>}
				<MessageText text={message.text} />
			</MessageBodyContainer>
		);
	}
}

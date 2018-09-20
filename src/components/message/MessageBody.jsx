import React from "react";
import styled from "styled-components";
import MessageText from "./MessageText.jsx";

const MessageBodyContainer = styled.div`
	display: inline-block;
	padding: 10px;
	border: solid lightgray 1px;
	border-radius: 2px;
`;

export default class MessageBody extends React.Component {
	render() {
		const {message, author} = this.props;
		return (
			<MessageBodyContainer>
				{this.props.firstInSeries && <h6>{author.nick}</h6>}
				<MessageText text={message.text}/>
			</MessageBodyContainer>
		)
	}
}

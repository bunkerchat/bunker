import React from "react";
import styled from "styled-components";
import MessageText from "./MessageText.jsx";

const MessageBodyContainer = styled.div`
	flex: 1;
`;

export default class MessageBody extends React.Component {
	render() {
		const { message, author } = this.props;
		return (
			<MessageBodyContainer className="px-2 pb-1">
				{this.props.firstInSeries && <h6 className="d-md-none">{author.nick}</h6>}
				<MessageText text={message.text} />
			</MessageBodyContainer>
		);
	}
}

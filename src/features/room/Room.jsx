import React from "react";
import ChatInput from "../input/ChatInput.jsx";
import RoomMemberList from "./RoomMemberList.jsx";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";
import styled from "styled-components";
import RoomTopic from "./RoomTopic.jsx";

const Container = styled.div`
	overflow: hidden;
`;

const MessagingContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

export default class Room extends React.PureComponent {
	render() {
		const { roomId, current } = this.props;
		return (
			<Container className={`${current ? "d-flex" : "d-none"}`}>
				<MessagingContainer>
					<RoomTopic roomId={roomId} />
					<ScrollingMessageList roomId={roomId} current={current} />
					<ChatInput roomId={roomId} />
				</MessagingContainer>
				<RoomMemberList roomId={roomId} />
			</Container>
		);
	}
}

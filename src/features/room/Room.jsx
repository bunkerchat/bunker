import React from "react";
import ChatInput from "../input/ChatInput.jsx";
import RoomMemberList from "./RoomMemberList.jsx";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";
import styled from "styled-components";

const RoomContainer = styled.div`
	display: flex;
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
			<RoomContainer>
				<MessagingContainer>
					<ScrollingMessageList roomId={roomId} current={current} />
					<ChatInput roomId={roomId} />
				</MessagingContainer>
				<RoomMemberList roomId={roomId} />
			</RoomContainer>
		);
	}
}

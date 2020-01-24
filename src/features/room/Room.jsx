import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { useMedia } from "react-use";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";
import RoomMemberList from "../roomMember/RoomMemberList.jsx";
import RoomTopic from "./RoomTopic.jsx";
import ChatInput from "../chatInput/ChatInput.jsx";
import { getActiveRoomId } from "./roomSelectors.js";

const Container = styled.div`
	overflow: hidden;
`;

const MessagingContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;
const Room = ({ rooms, activeRoomId }) => {
	const isDesktop = useMedia("(min-width: 720px)");

	if (!activeRoomId) return null;

	return (
		<Container className="d-flex">
			<MessagingContainer>
				<RoomTopic />

				{_.map(rooms, (room, roomId) => (
					<ScrollingMessageList roomId={roomId} current={roomId === activeRoomId} key={roomId} />
				))}
				<ChatInput />
			</MessagingContainer>
			{isDesktop && <RoomMemberList />}
		</Container>
	);
};

const mapStateToProps = state => ({
	activeRoomId: getActiveRoomId(state),
	rooms: state.rooms
});

export default connect(mapStateToProps)(Room);

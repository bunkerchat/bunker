import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useMedia, useTitle } from "react-use";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";
import RoomMemberList from "../roomMember/RoomMemberList.jsx";
import RoomTopic from "./RoomTopic.jsx";
import ChatInput from "../chatInput/ChatInput.jsx";
import { getDocumentTitle } from "../chat/chatSelectors.js";
import { getActiveRoomId, getRooms } from "./roomSelectors.js";

const Container = styled.div`
	overflow: hidden;
`;

const MessagingContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;
const Room = () => {
	const title = useSelector(getDocumentTitle);
	const activeRoomId = useSelector(getActiveRoomId);
	const rooms = useSelector(getRooms);

	useTitle(title);
	const isDesktop = useMedia("(min-width: 720px)");

	return (
		<Container className={activeRoomId ? "d-flex" : "d-none"}>
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

export default Room;

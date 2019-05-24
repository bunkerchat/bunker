import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import ScrollingMessageList from "../message/ScrollingMessageList.jsx";
import RoomMemberList from "../roomMember/RoomMemberList.jsx";
import RoomTopic from "./RoomTopic.jsx";
import { getActiveRoomId } from "../../selectors/selectors.js";
import ChatInput from "../input/ChatInput.jsx";
import BroadcastTypingEvents from "./BroadcastTypingEvents.jsx";

const Container = styled.div`
	overflow: hidden;
`;

const MessagingContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;
class Room extends React.PureComponent {
	render() {
		const { rooms, activeRoomId } = this.props;

		if (!activeRoomId) return null;

		return (
			<Container className="d-flex">
				<MessagingContainer>
					<RoomTopic />

					{_.map(rooms, (room, roomId) => (
						<ScrollingMessageList roomId={roomId} current={room.current} key={roomId} />
					))}
					<ChatInput />
					<BroadcastTypingEvents />
				</MessagingContainer>
				<RoomMemberList />
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	activeRoomId: getActiveRoomId(state),
	rooms: state.rooms
});


export default connect(mapStateToProps)(Room);

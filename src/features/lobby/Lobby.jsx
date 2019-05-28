import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import theme from "../../constants/theme";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

const UnreadMessageBadge = styled.span`
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionHeaderForegroundColor};
	}
`;

class LobbyRoomLink extends React.PureComponent {
	render() {
		const { room, roomMember } = this.props;
		if (!room) return null;
		return (
			<Link
				className="list-group-item p-3 d-flex justify-content-between align-items-center"
				to={`/2/room/${room._id}`}
			>
				{room.name}
				{roomMember.unreadMessageCount > 0 && (
					<UnreadMessageBadge className={`badge badge-primary ${roomMember.unreadMention ? "mention" : ""}`}>
						{roomMember.unreadMessageCount}
					</UnreadMessageBadge>
				)}
			</Link>
		);
	}
}

const RoomList = ({ rooms, roomMembers }) => (
	<ul className="list-group mb-3">
		{_.map(roomMembers, roomMember => (
			<LobbyRoomLink room={_.find(rooms, { _id: roomMember.room })} roomMember={roomMember} key={roomMember._id} />
		))}
	</ul>
);

class Lobby extends React.PureComponent {
	render() {
		const { rooms, localRoomMembersByRoom } = this.props;

		const unreadRoomMembers = _(localRoomMembersByRoom)
			.filter(roomMember => roomMember.unreadMessageCount > 0)
			.orderBy(["unreadStart"])
			.value();
		const readRoomMembers = _(localRoomMembersByRoom)
			.filter(roomMember => !roomMember.unreadMessageCount)
			.sortBy("roomOrder")
			.value();

		return (
			<Container className="container-fluid mt-3">
				{unreadRoomMembers.length > 0 && <RoomList rooms={rooms} roomMembers={unreadRoomMembers} />}
				{readRoomMembers.length > 0 && <RoomList rooms={rooms} roomMembers={readRoomMembers} />}
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	rooms: state.rooms,
	localRoomMembersByRoom: state.localRoomMembers.byRoom
});

export default connect(mapStateToProps)(Lobby);

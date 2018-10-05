import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
	flex: 1;
	overflow: auto;
`;

const mapStateToProps = state => ({
	rooms: state.rooms,
	localRoomMembersByRoom: state.localRoomMembers.byRoom
});

const RoomLink = ({ room, roomMember }) => (
	<Link className="list-group-item p-3 d-flex justify-content-between align-items-center" to={`/2/room/${room._id}`}>
		{room.name}
		{roomMember.unreadMessageCount > 0 && (
			<span className="badge badge-primary">{roomMember.unreadMessageCount}</span>
		)}
	</Link>
);

const RoomList = ({title, rooms, roomMembers}) => (
	<div className="mb-3">
		<h6>{title}</h6>
		<ul className="list-group list-group-flush">
			{_.map(roomMembers, roomMember => (
				<RoomLink room={_.find(rooms, { _id: roomMember.room })} roomMember={roomMember} key={roomMember._id}/>
			))}
		</ul>
	</div>
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
				{unreadRoomMembers.length > 0 && <RoomList title="Unread" rooms={rooms} roomMembers={unreadRoomMembers}/>}
				{readRoomMembers.length > 0 && <RoomList title="Rooms" rooms={rooms} roomMembers={readRoomMembers}/>}
			</Container>
		);
	}
}

export default connect(mapStateToProps)(Lobby);

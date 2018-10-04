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
			<span className="badge badge-primary d-md-none">{roomMember.unreadMessageCount}</span>
		)}
	</Link>
);

class Lobby extends React.PureComponent {
	render() {
		const { rooms, localRoomMembersByRoom } = this.props;
		return (
			<Container className="container-fluid mt-3">
				<ul className="list-group">
					{_.map(rooms, room => (
						<RoomLink room={room} roomMember={localRoomMembersByRoom[room._id]} key={room._id} />
					))}
				</ul>
			</Container>
		);
	}
}

export default connect(mapStateToProps)(Lobby);

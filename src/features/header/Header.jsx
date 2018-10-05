import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { totalUnreadMessageCount } from "../../selectors/selectors";

const RoomListItem = styled.li`
	position: relative;
`;

const UnreadMessageBadge = styled.span`
	position: absolute;
	top: 0px;
	right: -3px;
`;

const mapStateToProps = state => ({
	rooms: state.rooms,
	localRoomMembersByRoom: state.localRoomMembers.byRoom,
	totalUnreadMessageCount: totalUnreadMessageCount(state)
});

const RoomLink = ({ room, roomMember }) => (
	<Link className="nav-link" to={`/2/room/${room._id}`}>
		{room.name}{" "}
		{roomMember.unreadMessageCount > 0 && (
			<UnreadMessageBadge className="badge badge-primary">{roomMember.unreadMessageCount}</UnreadMessageBadge>
		)}
	</Link>
);

class Header extends React.PureComponent {
	render() {
		const { rooms, localRoomMembersByRoom, totalUnreadMessageCount } = this.props;
		return (
			<div>
				<nav className="navbar navbar-expand navbar-dark bg-dark">
					<Link className="navbar-brand" to={`/2/lobby`}>
						Bunker{" "}
						{totalUnreadMessageCount > 0 && (
							<span className="badge badge-primary d-md-none">{totalUnreadMessageCount}</span>
						)}
					</Link>
					<ul className="navbar-nav d-none d-md-flex">
						{_.map(rooms, room => (
							<RoomListItem className={`nav-item px-3 ${room.current ? "active" : ""}`} key={room._id}>
								<RoomLink room={room} roomMember={localRoomMembersByRoom[room._id]} />
							</RoomListItem>
						))}
					</ul>
					<div className="ml-auto navbar-nav text-right">
						<Link className="nav-item nav-link" to={`/2/settings`}>
							<FontAwesomeIcon icon="cog" />
						</Link>
					</div>
				</nav>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Header);

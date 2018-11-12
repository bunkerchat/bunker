import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { hasAnyUnreadMention, getTotalUnreadMessageCount } from "../../selectors/selectors";
import theme from "../../constants/theme";

const RoomListItem = styled.li`
	position: relative;
`;

const FloatingRightBadge = styled.div`
	position: absolute;
	top: 0px;
	right: -3px;
`;

const UnreadMessageBadge = styled.span`
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionHeaderForegroundColor};
	}
`;

const mapStateToProps = state => ({
	rooms: state.rooms,
	localRoomMembersByRoom: state.localRoomMembers.byRoom,
	totalUnreadMessageCount: getTotalUnreadMessageCount(state),
	anyUnreadMention: hasAnyUnreadMention(state)
});

class HeaderRoomLink extends React.PureComponent {
	render() {
		const { room, roomMember } = this.props;
		return (
			<Link className="nav-link" to={`/2/room/${room._id}`}>
				{room.name}{" "}
				{roomMember.unreadMessageCount > 0 && (
					<FloatingRightBadge>
						<UnreadMessageBadge className={`badge badge-primary ${roomMember.unreadMention ? "mention" : ""}`}>
							{roomMember.unreadMessageCount}
						</UnreadMessageBadge>
					</FloatingRightBadge>
				)}
			</Link>
		);
	}
}

class Header extends React.PureComponent {
	render() {
		const { rooms, localRoomMembersByRoom, totalUnreadMessageCount, anyUnreadMention } = this.props;
		return (
			<div>
				<nav className="navbar navbar-expand navbar-dark bg-dark">
					<Link className="navbar-brand" to={`/2/lobby`}>
						Bunker{" "}
						{totalUnreadMessageCount > 0 && (
							<UnreadMessageBadge className={`badge badge-primary d-md-none ${anyUnreadMention ? "mention" : ""}`}>
								{totalUnreadMessageCount}
							</UnreadMessageBadge>
						)}
					</Link>
					<ul className="navbar-nav d-none d-md-flex">
						{_.map(rooms, room => (
							<RoomListItem className={`nav-item px-lg-3 ${room.current ? "active" : ""}`} key={room._id}>
								<HeaderRoomLink room={room} roomMember={localRoomMembersByRoom[room._id]} />
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

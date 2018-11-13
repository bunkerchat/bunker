import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { hasAnyUnreadMention, getTotalUnreadMessageCount } from "../../selectors/selectors";
import HeaderRoomLink from "./HeaderRoomLink.jsx";
import UnreadMessageBadge from "./UnreadMessageBadge.jsx";

const RoomListItem = styled.li`
	position: relative;
`;

const mapStateToProps = state => ({
	rooms: state.rooms,
	localRoomMembersByRoom: state.localRoomMembers.byRoom,
	totalUnreadMessageCount: getTotalUnreadMessageCount(state),
	anyUnreadMention: hasAnyUnreadMention(state)
});

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
						{_.map(rooms, room => {
							const roomMember = localRoomMembersByRoom[room._id];
							return (
								<RoomListItem className={`nav-item px-lg-3 ${room.current ? "active" : ""}`} key={room._id}>
									<HeaderRoomLink
										roomId={room._id}
										roomName={room.name}
										unreadMention={roomMember.unreadMention}
										unreadMessageCount={roomMember.unreadMessageCount}
									/>
								</RoomListItem>
							);
						})}
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

import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const RoomListItem = styled.li`
	position: relative;
`;

const UnreadMessageBadge = styled.span`
	position: absolute;
	top: 0px;
	right: -3px;
`;

const mapStateToProps = state => ({
	rooms: state.rooms
});

class Header extends React.Component {
	render() {
		const { rooms } = this.props;
		return (
			<div>
				<nav className="navbar navbar-expand navbar-dark bg-dark fixed-top">
					<Link className="navbar-brand" to={`/2/lobby`}>
						Bunker
					</Link>
					<ul className="navbar-nav d-none d-md-flex">
						{_.map(rooms, room => (
							<RoomListItem className={`nav-item px-3 ${room.current ? "active" : ""}`} key={room._id}>
								<Link className="nav-link" to={`/2/room/${room._id}`}>
									{room.name}{" "}
									{room.unreadMessageCount > 0 && (
										<UnreadMessageBadge className="badge badge-primary">{room.unreadMessageCount}</UnreadMessageBadge>
									)}
								</Link>
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

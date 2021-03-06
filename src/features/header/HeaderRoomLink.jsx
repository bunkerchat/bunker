import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import UnreadMessageBadge from "./UnreadMessageBadge.jsx";
import { Link } from "react-router-dom";
import { getUnreadMention, getUnreadMessageCount } from "../users/usersSelectors.js";
import { getRoomIsCurrent, getRoomName } from "../room/roomSelectors.js";

const RoomListItem = styled.li`
	position: relative;
`;

const FloatingRightBadge = styled.div`
	position: absolute;
	top: 0px;
	right: -3px;
`;

function HeaderRoomLink({
	// props
	roomId,

	//state
	roomName,
	current,
	name,
	unreadMention,
	unreadMessageCount
}) {
	return (
		<RoomListItem className={`nav-item px-lg-3 ${current ? "active" : ""}`}>
			<Link className="nav-link" to={`/2/room/${roomId}`}>
				{roomName}{" "}
				{unreadMessageCount > 0 && (
					<FloatingRightBadge>
						<UnreadMessageBadge className={`badge badge-primary ${unreadMention ? "mention" : ""}`}>
							{unreadMessageCount}
						</UnreadMessageBadge>
					</FloatingRightBadge>
				)}
			</Link>
		</RoomListItem>
	);
}

const makeMapStateToProps = (initialState, { roomId }) => {
	return state => ({
		current: getRoomIsCurrent(roomId)(state),
		roomName: getRoomName(roomId)(state),
		unreadMention: getUnreadMention(roomId)(state),
		unreadMessageCount: getUnreadMessageCount(roomId)(state)
	});
};

export default connect(makeMapStateToProps)(HeaderRoomLink);

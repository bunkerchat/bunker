import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { getRoomName, getUnreadMention, getUnreadMessageCount } from "../../selectors/selectors.js";

import styled from "styled-components";
import theme from "../../constants/theme.js";

const UnreadMessageBadge = styled.span`
	&.mention {
		background-color: ${theme.mentionBackgroundColor};
		color: ${theme.mentionHeaderForegroundColor};
	}
`;

function LobbyRoomLink({
	// drilled
	roomId,

	//state
	name,
	unreadMessageCount,
	unreadMention
}) {
	return (
		<Link className="list-group-item p-3 d-flex justify-content-between align-items-center" to={`/2/room/${roomId}`}>
			{name}
			{unreadMessageCount > 0 && (
				<UnreadMessageBadge className={`badge badge-primary ${unreadMention ? "mention" : ""}`}>
					{unreadMessageCount}
				</UnreadMessageBadge>
			)}
		</Link>
	);
}

const mapStateToProps = (initialState, { roomId }) => state => ({
	name: getRoomName(roomId)(state),
	unreadMessageCount: getUnreadMessageCount(roomId)(state),
	unreadMention: getUnreadMention(roomId)(state)
});

export default connect(mapStateToProps)(LobbyRoomLink);

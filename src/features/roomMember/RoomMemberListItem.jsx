import React from "react";
import RoomMember from "./RoomMember.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { connect } from "react-redux";
import { getRoomMemberRoleForCurrentRoomByUserId } from "../../selectors/selectors.js";

const ListItem = styled.li`
	&.disabled {
		opacity: 0.25;
	}
`;

function RoomMemberListItem({ role, connected, userId, hasUser }) {
	if (!hasUser) return null;

	return (
		<ListItem
			className={`list-group-item p-2 d-flex justify-content-between align-items-center ${
				!connected ? "disabled" : ""
			}`}
		>
			<RoomMember userId={userId} />
			{role === "administrator" ? (
				<FontAwesomeIcon icon="gavel" />
			) : role === "moderator" ? (
				<FontAwesomeIcon icon="comments" />
			) : null}
		</ListItem>
	);
}

const mapStateToProps = (initialState, initialProps) => {
	const roomMemberRole = getRoomMemberRoleForCurrentRoomByUserId(initialProps.userId);

	return state => ({
		role: roomMemberRole(state),
		hasUser: !!state.users[initialProps.userId],
		connected:  (state.users[initialProps.userId] || {}).connected
	});
};

export default connect(mapStateToProps)(RoomMemberListItem);

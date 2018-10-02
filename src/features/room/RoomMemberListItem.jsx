import React from "react";
import RoomMember from "./RoomMember.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const ListItem = styled.li`
	&.disabled {
		opacity: 0.25;
	}
`;

export default class RoomMemberListItem extends React.PureComponent {
	render() {
		const { roomId, roomMember, user } = this.props;
		return (
			<ListItem
				className={`list-group-item p-2 d-flex justify-content-between align-items-center ${
					!user.connected ? "disabled" : ""
				}`}
			>
				<RoomMember roomId={roomId} user={user} />
				{roomMember.role === "administrator" ? (
					<FontAwesomeIcon icon="gavel" />
				) : roomMember.role === "moderator" ? (
					<FontAwesomeIcon icon="comments" />
				) : null}
			</ListItem>
		);
	}
}

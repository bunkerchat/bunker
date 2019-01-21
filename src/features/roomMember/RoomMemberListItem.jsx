import React from "react";
import RoomMember from "./RoomMember.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { connect } from "react-redux";

const ListItem = styled.li`
	&.disabled {
		opacity: 0.25;
	}
`;

const mapStateToProps = (state, props) => ({
	hasUser: !!state.users[props.userId],
	connected: (state.users[props.userId] || {}).connected
});

class RoomMemberListItem extends React.Component {
	render() {
		const { role, connected, userId, hasUser } = this.props;
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
}

export default connect(mapStateToProps)(RoomMemberListItem);

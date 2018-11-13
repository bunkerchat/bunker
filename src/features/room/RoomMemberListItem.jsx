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

const mapStateToProps = (state, props) => {
	const user = state.users[props.userId];
	return _.pick(user, "nick", "email", "connected", "present", "typingIn");
};

class RoomMemberListItem extends React.PureComponent {
	render() {
		const { roomId, role, nick, email, connected, present, typingIn } = this.props;
		return (
			<ListItem
				className={`list-group-item p-2 d-flex justify-content-between align-items-center ${
					!connected ? "disabled" : ""
				}`}
			>
				<RoomMember
					roomId={roomId}
					nick={nick}
					email={email}
					connected={connected}
					present={present}
					typingIn={typingIn}
				/>
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

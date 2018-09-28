import React from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
	&.disabled {
		opacity: 0.25;
	}
`;

const IconContainer = styled.div`
	display: inline-block;
	width: 25px;
	height: 25px;
	text-align: center;
	vertical-align: middle;
`;

export default class RoomMember extends React.Component {
	render() {
		const { roomId, user } = this.props;
		return (
			<Container className={!user.connected ? "disabled" : ""}>
				{user.connected && user.typingIn === roomId ? (
					<IconContainer>
						<FontAwesomeIcon icon="ellipsis-h" />
					</IconContainer>
				) : (
					<Gravatar email={user.email} size={25} rating="pg" default="monsterid" />
				)}
				<span className="ml-2">{user.nick}</span>
			</Container>
		);
	}
}

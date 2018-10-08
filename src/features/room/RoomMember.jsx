import React from "react";
import styled from "styled-components";
import Gravatar from "react-gravatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserStatus from "../users/UserStatus.jsx";

const Container = styled.div`
	display: flex;
`;

const IconContainer = styled.div`
	display: inline-block;
	width: 25px;
	height: 25px;
	text-align: center;
	vertical-align: middle;
`;

const UserContainer = styled.div`
	flex: 1;
	display: flex;
`;

export default class RoomMember extends React.PureComponent {
	render() {
		const { roomId, user } = this.props;
		return (
			<Container>
				{user.connected && user.typingIn === roomId ? (
					<IconContainer>
						<FontAwesomeIcon icon="ellipsis-h"/>
					</IconContainer>
				) : (
					<UserContainer>
						<UserStatus user={user}/>
						<Gravatar email={user.email} size={25} rating="pg" default="monsterid"/>
					</UserContainer>
				)}
				<div className="ml-2">{user.nick}</div>
			</Container>
		);
	}
}

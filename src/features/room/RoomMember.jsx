import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserImage from "../users/UserImage.jsx";

const Container = styled.div`
	display: flex;
`;

const IconContainer = styled.div`
	display: inline-block;
	width: 28px;
	height: 25px;
	text-align: center;
	vertical-align: middle;
`;

const Nick = styled.div`
	line-height: 25px;
`;

export default class RoomMember extends React.PureComponent {
	render() {
		const { roomId, nick, email, connected, present, typingIn } = this.props;
		return (
			<Container>
				{connected && typingIn === roomId ? (
					<IconContainer>
						<FontAwesomeIcon icon="ellipsis-h" />
					</IconContainer>
				) : (
					<UserImage email={email} connected={connected} present={present} />
				)}
				<Nick className="ml-2">{nick}</Nick>
			</Container>
		);
	}
}
